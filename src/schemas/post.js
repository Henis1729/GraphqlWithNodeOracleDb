import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    getPostById(PID: Number!): Post
    getAllPost: [Post]
    getAllPostByUser(UID: Number): [Post]
    getAllPostWithPaginate(page:Number, limit:Number, search: String, sort: typeSort): paginatePost
  }

  enum typeOrder {
    ASC
    DESC
  }

  input typeSort {
    key: String
    order: typeOrder
  }

  type paginatePost {
    count: Number 
    data: [Post]
  }

  type Post {
    PID: Number
    TITLE: String
    USERNAME: String
    CREATEDAT: Date
    USERID: Number
  }

  input inputPost {
    TITLE: String!
  }

  input updateInputPost {
    PID: Number!
    TITLE: String
  }

  extend type Mutation {
    createPost(input: inputPost): Post
    updatePost(input: updateInputPost): Post
    deletePost(PID: Number!): Boolean
  }
`;
