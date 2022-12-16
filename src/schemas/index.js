import { gql } from 'apollo-server-express';
import userSchema from './user'
import postSchema from './post'
import agentSchema from './agents'
import customerSchema from './customer'

const linkSchema = gql`
    scalar Date
    scalar JSON
    scalar Number

    directive @isAuth on FIELD_DEFINITION

    type Query {
        _ : Boolean
    }

    type Mutation {
        _ : Boolean
    }

    type Subscription {
        _ : Boolean
    }

    enum typeOrder {
        ASC
        DESC
    }

    input typeSort {
        key: String
        order: typeOrder
    }
`;


export default [
    linkSchema,
    userSchema,
    postSchema,
    agentSchema,
    customerSchema,
];