import { gql } from "apollo-server-express";

export default gql`
  
extend type Query {
    getAllAgent: [Agent]
    getAllAgentWithPaginate(page:Number, limit:Number, search: String, sort: typeSort): paginateAgents
  }

  type paginateAgents {
    count: Number 
    data: [Agent]
  }

  type Agent {
    AGENT_CODE: String
	  AGENT_NAME: String
	  WORKING_AREA: String
	  COMMISSION: Number
	  PHONE_NO: String
	  COUNTRY: String
  }

  input inputAgent {
    AGENT_NAME: String
    WORKING_AREA: String
    COMMISSION: Number
    PHONE_NO: String
    COUNTRY: String
  }

  extend type Mutation {
    createAgent(input: inputAgent): Agent
  }
`;
