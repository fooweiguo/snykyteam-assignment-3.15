module.exports.handler = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "3.14 Activity! This is function is done by SnykyTeam!",
          input: event,
        },
        null,
        2
      ),
    };
  };