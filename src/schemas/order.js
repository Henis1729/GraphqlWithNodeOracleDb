import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    getAllOrder: [Order]
    getAllOrderWithPaginate(page:Number, limit:Number, search: String, sort: typeSort): paginateOrder
  }

  type paginateOrder {
    count: Number 
    data: [Order]
  }

  type Order {
    ORD_NUM: Number
    ORD_AMOUNT: Number
    ADVANCE_AMOUNT: Number
    ORD_DATE: Date
    CUST_CODE: String
    AGENT_CODE: String
    ORD_DESCRIPTION: String
  }

  input inputPost {
    ORD_NUM: Number
    ORD_AMOUNT: Number
    ADVANCE_AMOUNT: Number
    ORD_DATE: Date
    CUST_CODE: String
    AGENT_CODE: String
    ORD_DESCRIPTION: String
  }

  input updateInputPost {
    PID: Number!
    TITLE: String
  }

  extend type Mutation {
    createOrder(input: inputPost): Order
  }
`;
