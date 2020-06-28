const mongoose = require('mongoose');
const { ApolloServer, gql } = require('apollo-server-express');
const {
  portfolioQueries,
  portfolioMutations,
  userMutations,
  userQueries,
  forumQueries,
} = require('./resolvers');
const { portfolioTypes, userTypes, forumTypes } = require('./types');
const { buildAuthContext } = require('./context');
const Portfolio = require('./models/portfolio');
const User = require('./models/user');
const ForumCategory = require('./models/forumCategory');
const Topic = require('./models/topic');

exports.createApolloServer = () => {
  const typeDefs = gql(`
    ${portfolioTypes}

    ${userTypes}

    ${forumTypes}

    type Query {
      portfolio(id: ID): Portfolio
      portfolios: [Portfolio]
      userPortfolios: [Portfolio]
      user: User
      forumCategories: [ForumCategory]
      topicsByCategory(category: String): [Topic]
    }

    type Mutation {
      createPortfolio(input: PortfolioInput): Portfolio
      updatePortfolio(id: ID, input: PortfolioInput): Portfolio
      deletePortfolio(id: ID): ID

      signUp(input: SignUpInput): String
      signIn(input: SignInInput): User
      signOut: Boolean
    }`);

  const resolvers = {
    Query: {
      ...portfolioQueries,
      ...userQueries,
      ...forumQueries,
    },
    Mutation: {
      ...portfolioMutations,
      ...userMutations,
    },
  };

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      ...buildAuthContext(req),
      models: {
        Portfolio: new Portfolio(mongoose.model('Portfolio'), req.user),
        User: new User(mongoose.model('User')),
        ForumCategory: new ForumCategory(mongoose.model('ForumCategory')),
        Topic: new Topic(mongoose.model('Topic')),
      },
    }),
  });

  return apolloServer;
};
