provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name
  website {
    index_document = "index.html"
  }
  tags = {
    Name = "WorkoutTrackerFrontend"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  block_public_acls = false
  block_public_policy = false
  ignore_public_acls = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = "*",
        Action = "s3:GetObject",
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

resource "aws_dynamodb_table" "tracker" {
  name         = "WorkoutLogs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "date_exercise"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "date_exercise"
    type = "S"
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy_attachment" "lambda_policy" {
  name       = "lambda-logs-policy"
  roles      = [aws_iam_role.lambda_exec.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "tracker" {
  function_name = "workoutLogger"
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "nodejs18.x"
  handler       = "index.handler"

  filename         = "${path.module}/lambda/index.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda/index.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.tracker.name
    }
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "WorkoutTrackerAPI"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.tracker.invoke_arn
}

resource "aws_apigatewayv2_route" "lambda_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /logs"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

output "s3_website_url" {
  value = aws_s3_bucket.frontend.website_endpoint
}

output "api_url" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}