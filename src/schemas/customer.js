import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    getAllCustomer: [Customer]
    getAllCustomerWithPaginate(page:Number, limit:Number, search: String, sort: typeSort): paginateCustomer
  }

  type paginateCustomer {
    count: Number 
    data: [Customer]
  }

  type Customer {
    CUST_CODE: String
    CUST_NAME: String
    CUST_CITY: String
    WORKING_AREA: String
    CUST_COUNTRY: String
    GRADE: Number
    OPENING_AMT: Number
    RECEIVE_AMT: Number
    PAYMENT_AMT: Number
    OUTSTANDING_AMT: Number
    PHONE_NO: String
  }

  input inputCustomer {
    CUST_NAME: String
    CUST_CITY: String
    WORKING_AREA: String
    CUST_COUNTRY: String
    GRADE: Number
    OPENING_AMT: Number
    RECEIVE_AMT: Number
    PAYMENT_AMT: Number
    OUTSTANDING_AMT: Number
    PHONE_NO: String
    AGENT_CODE: String
  }

  extend type Mutation {
    createCustomer(input: inputCustomer): Customer
  }
`;
