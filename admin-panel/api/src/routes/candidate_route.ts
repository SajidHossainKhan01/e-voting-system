import { NextFunction, Request, Response, Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  createCandidateBody,
  deleteCandidateParams,
  getAllCandidateParams,
  updateCandidateBody,
  updateCandidateParams,
} from "../../shared/validators/candidateValidator";
import { database } from "../mongodb_connection/connection";
import { AFFILIATION_TYPE, CandidateModel } from "../models/candidateModel";
import { CollectionListNames } from "../config/config";
import { ObjectId } from "mongodb";

const candidateRouter = Router();

// Get all candidates
candidateRouter.get(
  "/get-all/:electionId",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { electionId } = getAllCandidateParams.parse(req.params);

      const candidateList = await database
        .collection<CandidateModel>(CollectionListNames.CANDIDATE)
        .find({ electionId: new ObjectId(electionId) })
        .toArray();

      return res.json({
        message: "Successfully get all candidate",
        candidateList: candidateList,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create new candidate
candidateRouter.post(
  "/create",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        voterId,
        electionId,
        candidateName,
        constituency,
        affiliationType,
        partyName,
      } = createCandidateBody.parse(req.body);

      const data = await database
        .collection<CandidateModel>(CollectionListNames.CANDIDATE)
        .find({
          voterId: new ObjectId(voterId),
        })
        .toArray();

      if (
        data.length > 0 &&
        (data[0]?.affiliationType !== affiliationType ||
          data[0]?.partyName !== partyName)
      )
        return res.status(409).json({
          message: "Affiliation and party name must be same for same candidate",
        });

      const dataFoundUsingConstituencyNumber = data.find((can) => {
        return (
          can.constituency.constituencyNumber ===
          constituency.constituencyNumber
        );
      });
      if (data.length > 0 && dataFoundUsingConstituencyNumber)
        return res.status(409).json({
          message: "Already registered with this constituency",
        });

      if (data.length === 5)
        return res.status(409).json({
          message: "This candidate is already registered for 5 constituencies",
        });

      const newCandidate = new CandidateModel(
        candidateName,
        new ObjectId(voterId),
        new ObjectId(electionId),
        constituency,
        affiliationType as (typeof AFFILIATION_TYPE)[keyof typeof AFFILIATION_TYPE],
        partyName
      );

      await database
        .collection<CandidateModel>(CollectionListNames.CANDIDATE)
        .insertOne(newCandidate);

      return res.status(200).json({
        message: "Successfully inserted new candidate",
        candidate: newCandidate,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete Candidate
candidateRouter.delete(
  "/delete/:candidateObjectId",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { candidateObjectId } = deleteCandidateParams.parse(req.params);

      const data = await database
        .collection<CandidateModel>(CollectionListNames.CANDIDATE)
        .findOneAndDelete({ _id: new ObjectId(candidateObjectId) });

      if (!data)
        return res.status(404).json({
          message: "Candidate does not exist",
        });

      return res.status(200).json({
        message: "Successfully deleted candidate",
        candidate: data,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update Candidate
candidateRouter.put(
  "/update/:voterId",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voterId } = updateCandidateParams.parse(req.params);
      const { affiliationType, partyName } = updateCandidateBody.parse(
        req.body
      );

      const result = await database
        .collection<CandidateModel>(CollectionListNames.CANDIDATE)
        .updateMany(
          {
            voterId: new ObjectId(voterId),
          },
          {
            $set: {
              affiliationType:
                affiliationType as (typeof AFFILIATION_TYPE)[keyof typeof AFFILIATION_TYPE],
              partyName: partyName,
            },
          }
        );

      if (result.matchedCount === 0)
        return res.status(404).json({
          message: "Candidate not found",
        });

      const candidateList = await database
        .collection<CandidateModel>(CollectionListNames.CANDIDATE)
        .find({
          voterId: new ObjectId(voterId),
        })
        .toArray();

      return res.status(200).json({
        message: "Successfully Updated Candidate",
        candidateList: candidateList,
      });
    } catch (error) {
      next(error);
    }
  }
);
export default candidateRouter;
