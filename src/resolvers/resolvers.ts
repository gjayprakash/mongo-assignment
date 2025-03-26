// src/resolvers.ts
import { IResolvers } from "@graphql-tools/utils";
import queryResolvers from "./queries";
import mutationResolvers from "./mutation";

const resolvers: IResolvers = {
  Query: queryResolvers.Query,
  Mutation: mutationResolvers.Mutation,
};

export default resolvers;
