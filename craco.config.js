module.exports = {
  webpack: {
    resolve: {
      fallback: {
        uuid: require.resolve('uuid'),
      },
    },
  },
};
