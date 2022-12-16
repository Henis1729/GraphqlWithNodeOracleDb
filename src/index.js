import "dotenv/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./schemas";
import resolvers from "./resolvers";
import  { connectDB } from "./models";
import { getPool } from "./models/getConnection";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

async function startServer() {
    const httpServer = createServer(app);
    const schema = makeExecutableSchema({typeDefs,resolvers});
    const server = new ApolloServer({
      schema,
      formatError: (error) => {
        const message = error.message
          .replace("SequelizeValidationError: ", "")
          .replace("Validation error: ", "")
          .replace("Unexpected error value: ", "")
          .replace("Context creation failed: ", "");
  
        return { ...error, message };
      },
      formatResponse: (response) => response,
      context: async ({ req, connection, res }) => {
        const pool = await getPool();
        if (req) {
          return {
            req,
            pool,
            res,
          };
        }
      },
      plugins: [
        {
          async serverWillStart() {
            return {
              async drainServer() {
                subscriptionServer.close();
              },
            };
          },
        },
      ],
    });
  
    const subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
        onConnect() { },
      },
      {
        server: httpServer,
        path: server.graphqlPath,
      }
    );
  
    await server.start();
    server.applyMiddleware({ app });
    connectDB().then(async () => {
      httpServer.listen(process.env.PORT, () =>
        console.log(`Server is now running on http://localhost:${process.env.PORT}/graphql`)
      );
    });
  }
  startServer();
  