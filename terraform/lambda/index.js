const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  const method = event.requestContext.http.method;
  const body = event.body ? JSON.parse(event.body) : {};

  if (method === 'POST') {
    const item = {
      user_id: body.user_id || "default_user",
      date_exercise: body.date + "#" + body.exercise,
      reps: body.reps,
      weight: body.weight,
    };

    await dynamo.put({ TableName: TABLE_NAME, Item: item }).promise();
    return { statusCode: 200, body: JSON.stringify({ message: 'Logged!' }) };
  } else if (method === 'GET') {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'user_id = :uid',
      ExpressionAttributeValues: { ':uid': "default_user" }
    };

    const result = await dynamo.query(params).promise();
    return { statusCode: 200, body: JSON.stringify(result.Items) };
  }

  return { statusCode: 400, body: 'Unsupported method' };
};