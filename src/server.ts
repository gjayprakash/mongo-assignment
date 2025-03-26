// src/server.ts
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./schema";
import connectDB from "./database/connection";
import resolvers from "./resolvers/resolvers";

const startServer = async () => {
  try {
    await connectDB();

    const app: Application = express();

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req, res }) => ({ req, res }),
    });

    await server.start();

    server.applyMiddleware({
      // @ts-ignore
      app,
      path: "/graphql",
    });

    const PORT = process.env.PORT || 9090;
    app.listen(PORT, () => {
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer().catch(console.error);
