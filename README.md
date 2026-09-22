# TypeSafe Jev .NET SDK

Typed .NET client for the [TypeSafe Jev API](https://docs.typesafe.ai/introduction).

Jev evaluates typed questions against text or structured state and returns structured answers. The SDK supports the three TypeSafe primitives:

- `Noul`: probability that a yes/no statement is true
- `Choice`: one option from a named set, with probabilities and confidence
- `Score`: a position on an ordered rubric, with per-level probabilities and confidence

## Quickstart

```csharp
using Typesafe.Jev;

using var client = new TypeSafeClient(options: new TypeSafeClientOptions
{
    ApiKey = Environment.GetEnvironmentVariable("TYPESAFE_API_KEY")
});

var response = await client.SystemOneAsync(
    state: "I was charged twice. Please fix this ASAP.",
    questions: new Dictionary<string, TypeSafeQuestion>
    {
        ["billing"] = new Noul { Instructions = "Is this ticket about billing?" },
        ["tone"] = new Choice
        {
            Instructions = "What is the customer's tone?",
            Criteria = new Dictionary<string, object?>
            {
                ["calm"] = null,
                ["frustrated"] = null,
                ["angry"] = null
            }
        },
        ["urgency"] = new Score
        {
            Instructions = "How urgent is this ticket?",
            Criteria = ["can wait", "this week", "today"]
        }
    });

Console.WriteLine(response.Nouls["billing"].Noul);
Console.WriteLine(response.Choices["tone"].Choice);
Console.WriteLine(response.Scores["urgency"].Score);
```

The client reads `TYPESAFE_API_KEY` when `ApiKey` is not supplied. It uses `jev-latest` by default and sends requests to `https://api.typesafe.ai/`.

## Development

```bash
dotnet test --project tests/unit-tests/Typesafe.Jev.UnitTests.csproj
dotnet test --project tests/integration-tests/Typesafe.Jev.IntegrationTests.csproj
dotnet build src/Typesafe.Jev.csproj
```

Unit tests use a stub HTTP handler and do not contact the TypeSafe service. Integration tests require `TYPESAFE_API_KEY` and use the live API.

## Documentation

The full VitePress documentation is in [`docs/`](docs/). Run it locally with:

```bash
cd docs
npm install
npm run docs:dev
```

Then open `http://localhost:5173`.
