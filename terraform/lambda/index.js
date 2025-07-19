const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME || "WorkoutLogs";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { user_name, date, day, log } = body;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        user_name,       // Partition key
        date,            // Sort key (ISO format)
        day,
        log              // Array of workout entries
      }
    };

    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Log saved successfully." })
    };
  } catch (err) {
    console.error("Error saving log:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save log." })
    };
  }
};
