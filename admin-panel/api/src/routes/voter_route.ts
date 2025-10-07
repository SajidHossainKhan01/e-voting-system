import { NextFunction, Request, Response, Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  createVoterBody,
  deleteVoterParams,
  getAllWardVotersBody,
  updateVoterBody,
  updateVoterParams,
} from "../../shared/validators/voterValidator";
import { database } from "../mongodb_connection/connection";
import { VoterModel } from "../models/voterModel";
import { CollectionListNames } from "../config/config";
import { ObjectId } from "mongodb";

const voterRouter = Router();

// Get all voters
voterRouter.get(
  "/get-all",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        constituencyName,
        constituencyNumber,
        districtName,
        divisionName,
        upazila,
        cityCorporation,
      } = getAllWardVotersBody.parse(req.body);

      const query: any = {};

      // Always check the higher level fields
      if (divisionName) query.divisionName = divisionName;
      if (districtName) query.districtName = districtName;
      if (constituencyName) query.constituencyName = constituencyName;
      if (constituencyNumber) query.constituencyNumber = constituencyNumber;

      // Check for upazila-based voter
      if (
        upazila?.upazilaName &&
        upazila?.unionName &&
        upazila?.wardNumber !== undefined
      ) {
        query["upazila.upazilaName"] = upazila.upazilaName;
        query["upazila.unionName"] = upazila.unionName;
        query["upazila.wardNumber"] = upazila.wardNumber;
      }

      // Or check for city corporation-based voter
      if (
        cityCorporation?.cityCorporationName &&
        cityCorporation?.wardNumber !== undefined
      ) {
        query["cityCorporation.cityCorporationName"] =
          cityCorporation.cityCorporationName;
        query["cityCorporation.wardNumber"] = cityCorporation.wardNumber;
      }

      const voterList = await database
        .collection<VoterModel>(CollectionListNames.VOTER)
        .find(query)
        .toArray();

      return res.status(200).json({
        message: "Successfully fetched voters",
        voterList: voterList,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create Voter
voterRouter.post(
  "/create",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voterId, voterName, constituency, dateOfBirth } =
        createVoterBody.parse(req.body);

      const exist = await database
        .collection<VoterModel>(CollectionListNames.VOTER)
        .findOne({
          voterId: voterId,
        });

      if (exist)
        return res.status(409).json({
          message: "VoterId already exists",
        });

      let constituencyNew: any;

      if (constituency.upazila) {
        constituencyNew = {
          divisionName: constituency.divisionName,
          districtName: constituency.districtName,
          constituencyNumber: constituency.constituencyNumber,
          constituencyName: constituency.constituencyName,
          homeAddress: constituency.homeAddress,
          upazila: constituency.upazila,
        };
      } else if (constituency.cityCorporation) {
        constituencyNew = {
          divisionName: constituency.divisionName,
          districtName: constituency.districtName,
          constituencyNumber: constituency.constituencyNumber,
          constituencyName: constituency.constituencyName,
          homeAddress: constituency.homeAddress,
          cityCorporation: constituency.cityCorporation,
        };
      } else {
        return res.status(409).json({
          message: "Constituency must contain upazila or city corporation",
        });
      }

      const newVoter = new VoterModel(
        voterId,
        voterName,
        dateOfBirth,
        constituencyNew
      );

      await database
        .collection<VoterModel>(CollectionListNames.VOTER)
        .insertOne(newVoter);

      return res.status(200).json({
        message: "Successfully created a new voter",
        voter: newVoter,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete a voter
voterRouter.delete(
  "/delete/:voterObjectId",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voterObjectId } = deleteVoterParams.parse(req.params);

      const data = await database
        .collection<VoterModel>(CollectionListNames.VOTER)
        .findOneAndDelete({
          _id: new ObjectId(voterObjectId),
        });

      if (!data)
        return res.status(404).json({
          message: "Voter does not exists",
        });

      return res.status(200).json({
        message: "Successfully deleted voter",
        voter: data,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update a voter
voterRouter.put(
  "/update/:voterObjectId",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voterObjectId } = updateVoterParams.parse(req.params);

      const { voterName, dateOfBirth, homeAddress, constituency } =
        updateVoterBody.parse(req.body);

      const updateFields: any = {};

      // top-level fields
      if (voterName) updateFields.voterName = voterName;
      if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;

      // nested constituency updates
      if (homeAddress) updateFields["constituency.homeAddress"] = homeAddress;
      if (constituency) {
        for (const [key, value] of Object.entries(constituency)) {
          updateFields[`constituency.${key}`] = value;
        }
      }

      const data = await database
        .collection<VoterModel>(CollectionListNames.VOTER)
        .findOneAndUpdate(
          { _id: new ObjectId(voterObjectId) },
          { $set: updateFields },
          { returnDocument: "after" }
        );

      if (!data) {
        return res.status(404).json({ message: "Voter not found" });
      }

      return res.status(200).json({
        message: "Successfully updated",
        voter: data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default voterRouter;
