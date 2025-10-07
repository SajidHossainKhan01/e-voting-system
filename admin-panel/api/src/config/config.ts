import dotenv from "dotenv";

dotenv.config();

export const CollectionListNames = {
  VOTER: "voter",
  CONSTITUENCY: "constituency",
  CANDIDATE: "candidate",
  ADMIN: "admin",
  ELECTION: "election",
} as const;

interface IConfig {
  port: number;
  mongodbUrl: string;
  databaseName: string;
  collectionList: (typeof CollectionListNames)[keyof typeof CollectionListNames][];
  jwtPrivateKey: string;
}

const config: IConfig = {
  port: Number(process.env.PORT) || 3000,
  mongodbUrl: process.env.MONGODB_URL || "mongodb://localhost:27017/",
  databaseName: process.env.DATABASE_NAME || "adminPanel",
  collectionList: [
    CollectionListNames.ADMIN,
    CollectionListNames.CANDIDATE,
    CollectionListNames.CONSTITUENCY,
    CollectionListNames.VOTER,
    CollectionListNames.ELECTION,
  ],
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY || "privatekey",
};

export default config;
