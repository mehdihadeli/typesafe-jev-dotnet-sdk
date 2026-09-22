# API reference

## `TypeSafeClient`

Creates an authenticated client for the TypeSafe API.

```csharp
using var client = new TypeSafeClient(
    options: new TypeSafeClientOptions
    {
        ApiKey = "your-api-key"
    });
```

### `SystemOneAsync`

```csharp
Task<SystemOneResponse> SystemOneAsync(
    object state,
    IReadOnlyDictionary<string, TypeSafeQuestion> questions,
    string? model = null,
    CancellationToken cancellationToken = default);
```

Posts to `POST /v1/systemone`. At least one question is required.

### `ListModelsAsync`

```csharp
Task<IReadOnlyList<ModelMetadata>> ListModelsAsync(
    CancellationToken cancellationToken = default);
```

Gets available models from `GET /v1/models`.

## `TypeSafeClientOptions`

| Property       | Default                    | Description                                    |
| -------------- | -------------------------- | ---------------------------------------------- |
| `ApiKey`       | `TYPESAFE_API_KEY`         | Bearer token used for authentication.          |
| `BaseUrl`      | `https://api.typesafe.ai/` | API root, useful for test servers.             |
| `DefaultModel` | `jev-latest`               | Model used when a call has no override.        |
| `MaxRetries`   | `2`                        | Retries for `408`, `429`, and `5xx` responses. |
| `RetryDelay`   | `250 ms`                   | Base delay used for exponential retry backoff. |

## Question primitives

### `Noul`

Use a `Noul` for a yes/no proposition. The answer is a probability from `0` to `1` that the proposition is true.

```csharp
new Noul
{
    Instructions = "Does this message request a refund?",
    Criteria = new NoulCriteria
    {
        True = "The customer explicitly asks for money back.",
        False = "The customer does not request money back."
    }
}
```

### `Choice`

Use a `Choice` when the answer must be one named alternative.

```csharp
new Choice
{
    Instructions = "Which team should handle this ticket?",
    Criteria = new Dictionary<string, object?>
    {
        ["billing"] = "Charges and payment problems",
        ["technical"] = "Bugs and integration problems",
        ["other"] = null
    }
}
```

`ChoiceAnswer.Probabilities` contains the distribution for every option and `Confidence` summarizes how concentrated it is.

### `Score`

Use a `Score` when the answer is a position on an ordered rubric.

```csharp
new Score
{
    Instructions = "How severe is this issue?",
    Criteria = [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature, but a workaround exists",
        "Blocking issue; no workaround exists"
    ]
}
```

`ScoreAnswer.Score` can be fractional. `Probabilities` is keyed by rubric level and `Legend` maps levels back to their descriptions.

## Response models

`SystemOneResponse` contains:

- `Model`: model used by the service.
- `Answers`: all answers keyed by the question IDs supplied by the caller.
- `Nouls`, `Choices`, and `Scores`: typed filtered views.
- `Usage`: reported input and output token counts when available.

## Errors

`TypeSafeApiException` is thrown for unsuccessful HTTP responses after retry handling. It exposes:

- `StatusCode`: returned HTTP status.
- `ResponseBody`: raw response text for diagnostics.

Missing API keys and invalid client options throw `InvalidOperationException` or `ArgumentOutOfRangeException` during client creation.
