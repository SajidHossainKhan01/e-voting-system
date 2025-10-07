/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class TallyRecord {
    @Property()
    public electionId: string = '';

    @Property()
    public constituencyId: string = '';

    @Property()
    public candidateId: string = '';

    @Property()
    public voteCount: number = 0;

    @Property()
    public updatedAt: string = "";
}
