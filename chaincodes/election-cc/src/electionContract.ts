/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Transaction } from "fabric-contract-api";
import { ElectionStatusRecord, PermitStatus, TPermitStatus } from "./record";
// import { KeyEndorsementPolicy } from 'fabric-shim';
import * as crypto from "crypto";

@Info({
  title: "Election Contract",
  description: "Election Smart Contract, implemented in TypeScript",
})
export class ElectionContract extends Contract {
  /**
   * Initialize the election poll
   * - Client provides: electionId
   */
  @Transaction()
  public async Initialize(ctx: Context, electionId: string): Promise<string> {
    this._require(electionId, "electionId is required");

    try {
      const exists = await this.electionExists(ctx, electionId);
      if (exists) {
        return `This election is exists with election id: ${electionId}`;
      }
      const txTime = ctx.stub.getTxTimestamp();
      const now = new Date(txTime.seconds.low * 1000).toISOString();

      const electionRecord: ElectionStatusRecord = {
        electionId,
        status: PermitStatus.INITIALIZED,
        updatedAt: now,
      };

      await ctx.stub.putState(
        electionRecord.electionId,
        Buffer.from(JSON.stringify(electionRecord))
      );

      return `Election has been initialized with election ID : ${electionId}`;
    } catch (error) {
      return `Internal server error: ${JSON.stringify(error)} | ${error}`;
    }
  }

  /**
   * Start election
   * - Start the election calling this function
   */

  @Transaction()
  public async StartElection(
    ctx: Context,
    electionId: string
  ): Promise<string> {
    this._require(electionId, "electionId is required");

    try {
      const electionBytes = await ctx.stub.getState(electionId);
      if (electionBytes.length === 0) {
        return "Election is not found";
      }

      const electionRec = JSON.parse(
        electionBytes.toString()
      ) as ElectionStatusRecord;

      if (electionRec.status === PermitStatus.STARTED) {
        return "This election is already started";
      }

      electionRec.status = PermitStatus.STARTED;
      electionRec.updatedAt = new Date().toISOString();

      const isAlreadyFinished = await this.checkAlreadyFinished(
        ctx,
        electionId
      );

      if (isAlreadyFinished) return "This election is already finished";

      await ctx.stub.putState(
        electionId,
        Buffer.from(JSON.stringify(electionRec))
      );

      return "Election started!";
    } catch (error) {
      return `Internal server error: ${error}`;
    }
  }

  /**
   * Finish election
   * - Finish the election by calling this function
   */
  @Transaction()
  public async FinishElection(
    ctx: Context,
    electionId: string
  ): Promise<string> {
    this._require(electionId, "electionId is required");

    try {
      const electionBytes = await ctx.stub.getState(electionId);
      if (electionBytes.length === 0) {
        return "Election is not found";
      }

      const electionRec = JSON.parse(
        electionBytes.toString()
      ) as ElectionStatusRecord;

      if (electionRec.status === PermitStatus.FINISHED) {
        return "This election is already finished";
      }

      electionRec.status = PermitStatus.FINISHED;
      electionRec.updatedAt = new Date().toISOString();

      await ctx.stub.putState(
        electionId,
        Buffer.from(JSON.stringify(electionRec))
      );

      return "Election has finished";
    } catch (error) {
      return `Internal server error: ${error}`;
    }
  }

  // Utility guard
  private _require(cond: any, msg: string): void {
    if (!cond) throw new Error(msg);
  }

  @Transaction(false)
  private async electionExists(
    ctx: Context,
    electionId: string
  ): Promise<boolean> {
    const electionJSON = await ctx.stub.getState(electionId);
    return electionJSON.length > 0;
  }

  @Transaction(false)
  public async isStarted(ctx: Context, electionId: string): Promise<boolean> {
    const electionBytes = await ctx.stub.getState(electionId);
    const electionRec = JSON.parse(
      electionBytes.toString()
    ) as ElectionStatusRecord;

    if (electionRec.status === PermitStatus.STARTED) {
      return true;
    } else {
      return false;
    }
  }

  @Transaction(false)
  public async checkAlreadyFinished(
    ctx: Context,
    electionId: string
  ): Promise<boolean> {
    const iterator = await ctx.stub.getHistoryForKey(electionId);
    try {
      while (true) {
        const res = await iterator.next();

        if (res.done) break;

        if (res.value && res.value.value.toString()) {
          const value = JSON.parse(res.value.value.toString()) as {
            electionId: string;
            status: TPermitStatus;
            updatedAt: string;
          };

          if (value.status === PermitStatus.FINISHED) {
            return true;
          }
        }
      }
      return false;
    } finally {
      await iterator.close();
    }
  }
}
