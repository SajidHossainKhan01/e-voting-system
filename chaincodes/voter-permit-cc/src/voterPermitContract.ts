/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { PermitRecord, PermitStatus, VoterRecord } from './record';
import { KeyEndorsementPolicy } from 'fabric-shim';
import * as crypto from 'crypto';

const PREFIX = {
    VOTER: 'VOTER',    // VOTER#electionId#voterHash
    PERMIT: 'PERMIT',  // PERMIT#electionId#permitHash
};

function sha256Hex(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

@Info({ title: 'VoterPermitContract', description: 'Voter Permit Smart Contract, using State Based Endorsement(SBE), implemented in TypeScript' })
export class VoterPermitContract extends Contract {

    /**
      * IssuePermit
      * - Client provides: electionId, voterHash (already hashed off-chain), permit (random string)
      * - Writes:
      *   - VOTER#electionId#voterHash -> { electionId, voterHash, issuedAt }
      *   - PERMIT#electionId#permitHash (status=issued)
      * - Throws if voter already has a permit for this election or permit already exists
      */
    @Transaction()
    public async IssuePermit(
        ctx: Context, electionId: string, voterHash: string, permit: string
    ): Promise<string> {
        this._require(electionId && voterHash && permit, 'electionId, voterHash, and permit are required');

        const voterKey = ctx.stub.createCompositeKey(PREFIX.VOTER, [electionId, voterHash]);
        const voterBytes = await ctx.stub.getState(voterKey);
        if (voterBytes && voterBytes.length) {
            throw new Error('Permit already issued for this voter in this election');
        }

        const permitHash = sha256Hex(permit);
        const permitKey = ctx.stub.createCompositeKey(PREFIX.PERMIT, [electionId, permitHash]);
        const permitBytes = await ctx.stub.getState(permitKey);
        if (permitBytes && permitBytes.length) {
            throw new Error('Permit already exists (hash collision / reuse)');
        }

        const now = new Date().toISOString();

        const voterRec: VoterRecord = { electionId, voterHash, issuedAt: now };
        const permitRec: PermitRecord = { electionId, permitHash, status: PermitStatus.ISSUED, issuedAt: now };

        await ctx.stub.putState(voterKey, Buffer.from(JSON.stringify(voterRec)));
        await ctx.stub.putState(permitKey, Buffer.from(JSON.stringify(permitRec)));

        // Return permitHash so the client can keep only the hash if desired
        return JSON.stringify({ permitHash });
    }


    /**
   * HasVoted (aka has permit issued)
   * - Returns true if a permit has already been issued to this voter for this election.
   *   (You can treat "issued" as "has voted/used opportunity", since the permit can only be spent once.)
   */

    @Transaction()
    public async HasVoted(
        ctx: Context, electionId: string, voterHash: string
    ): Promise<string> {
        this._require(electionId && voterHash, 'electionId and voterHash are required');
        const voterKey = ctx.stub.createCompositeKey(PREFIX.VOTER, [electionId, voterHash]);
        const voterBytes = await ctx.stub.getState(voterKey);
        return JSON.stringify({ has: !!(voterBytes && voterBytes.length) });
    }

    /**
    * ValidateAndSpendPermit (INTERNAL - called by other chaincode)
    * - Input: electionId, permitHash
    * - Ensures the permit exists and is in 'issued' state, then marks it 'spent'.
    * - Returns "OK" on success.
    */
    @Transaction()
    public async ValidateAndSpendPermit(
        ctx: Context, electionId: string, permitHash: string
    ): Promise<string> {
        this._require(electionId && permitHash, 'electionId and permitHash are required');

        const permitKey = ctx.stub.createCompositeKey(PREFIX.PERMIT, [electionId, permitHash]);
        const permitBytes = await ctx.stub.getState(permitKey);
        if (!permitBytes || !permitBytes.length) {
            throw new Error('Permit not found');
        }

        const rec = JSON.parse(permitBytes.toString()) as PermitRecord;
        if (rec.status !== 'issued') {
            throw new Error('Permit already spent or invalid');
        }

        rec.status = PermitStatus.SPENT;
        rec.spentAt = new Date().toISOString();
        await ctx.stub.putState(permitKey, Buffer.from(JSON.stringify(rec)));

        return 'OK';
    }

    // Utility guard
    private _require(cond: any, msg: string): void {
        if (!cond) throw new Error(msg);
    }
}
