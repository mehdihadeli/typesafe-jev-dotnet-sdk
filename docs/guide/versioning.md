# Versioning with NBGV

The SDK uses [Nerdbank.GitVersioning (NBGV)](https://dotnet.github.io/Nerdbank.GitVersioning/) to calculate package and assembly versions from committed version intent and Git history.

This is a single-branch GitHub Flow policy:

- `main` is the only long-lived development branch.
- Preview, RC, and stable changes to release intent are reviewed pull requests.
- Tags identify the exact RC or stable commit that was approved.
- CI uses a full Git clone so NBGV can calculate version height.

## Version lifecycle

```text
0.1.0-preview.N -> 0.1.0-rc.N -> 0.1.0
```

The suffix is committed in `version.json`. A tag does not promote a preview or RC into another release state.

| State                | GitHub Flow action                 | Example            |
| -------------------- | ---------------------------------- | ------------------ |
| Start development    | Merge a PR changing `version.json` | `0.1.0-preview.1`  |
| Continue development | Merge ordinary PRs                 | Same rolling draft |
| Publish next preview | Merge another version PR           | `0.1.0-preview.2`  |
| Start stabilization  | Merge an RC version PR             | `0.1.0-rc.1`       |
| Publish RC           | Tag the approved commit            | `v0.1.0-rc.1`      |
| Declare stable       | Merge a stable version PR          | `0.1.0`            |
| Publish stable       | Tag the approved commit            | `v0.1.0`           |

## Configure `version.json`

The repository uses an explicit three-part prerelease version:

```json
{
  "$schema": "https://raw.githubusercontent.com/dotnet/Nerdbank.GitVersioning/main/src/NerdBank.GitVersioning/version.schema.json",
  "version": "0.1.0-preview.1",
  "publicReleaseRefSpec": [
    "^refs/heads/main$",
    "^refs/tags/v\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?$"
  ],
  "release": {
    "tagName": "v{version}"
  },
  "cloudBuild": {
    "buildNumber": {
      "enabled": true
    }
  }
}
```

`publicReleaseRefSpec` makes builds from `main` and version tags public release builds. `SemVer2` is the canonical release value used by CI and Release Drafter.

## Prepare a release locally

Install NBGV once:

```bash
dotnet tool install --global nbgv
```

Prepare the next preview through a pull request:

```bash
./release-version.sh prepare-preview 0.1.0
git add version.json
git commit -m "Start 0.1 preview"
```

The helper reads the current matching preview number and increments it. Ordinary feature, fix, test, and documentation PRs do not change `version.json`.

Check the calculated version locally:

```bash
nbgv get-version -v SemVer2
```

Use `SemVer2` for Release Drafter metadata. Do not use `NuGetPackageVersion`, which can normalize prerelease numbers.

## Publish a release candidate

Prepare the RC through a reviewed version PR:

```bash
./release-version.sh prepare-rc 0.1.0
git add version.json
git commit -m "Begin 0.1 release candidate"
```

After the exact merged `main` commit is validated, create and push its tag:

```bash
./release-version.sh tag
git push origin v0.1.0-rc.1
```

If another RC is required, merge fixes and run `prepare-rc 0.1.0` again. NBGV creates the tag from the calculated version and does not modify `version.json`.

## Publish a stable release

Remove the prerelease designation through a version PR:

```bash
./release-version.sh prepare-stable 0.1.0
git add version.json
git commit -m "Declare 0.1 stable"
```

Validate the exact merged commit, then tag it:

```bash
nbgv get-version -v SemVer2
./release-version.sh tag
git push origin v0.1.0
```

The tag workflow publishes the NuGet package and matching Release Drafter release. After stable publication, start the next development line:

```bash
./release-version.sh prepare-preview 0.2.0
```

## GitHub Actions

The repository uses one release workflow for validation and publication:

| Workflow                | Trigger                          | Responsibility                                                                           |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `build-and-publish.yml` | Pull requests, `main`, `v*` tags | Restore, build, test, pack, publish packages, upload assets, and update Release Drafter. |
| `deploy-docs.yml`       | Documentation changes on `main`  | Build VitePress and deploy GitHub Pages.                                                 |
| `labeler.yml`           | Pull request changes             | Apply source, test, build, and documentation labels.                                     |

There is no separate Release Drafter workflow. This prevents duplicate drafts and competing publication runs. Every version-calculating workflow uses `actions/checkout` with `fetch-depth: 0`.

The build workflow behavior is:

- Pull requests: build and test only.
- Ordinary `main` pushes: build and validate; no release publication unless the committed version is a preview.
- Preview `main` pushes: publish the preview package and create or update a GitHub prerelease draft.
- RC and stable `v*` tags: publish the approved package and matching GitHub release.

The workflow requires `NUGET_API_KEY` for NuGet publication. Live integration tests run when `TYPESAFE_API_KEY` is configured and are skipped otherwise.

Release Drafter uses `include-pre-releases: false`, keeping the previous stable release as the comparison baseline for stable notes. Do not create a second GitHub Release manually.

## End-to-end flow

### Preview

```bash
./release-version.sh prepare-preview 0.1.0
git add version.json
git commit -m "Start 0.1.0-preview.1"
git push origin <branch>
```

Merge the PR. CI calculates `0.1.0-preview.1`, publishes the preview package, and creates or updates the draft named `v0.1.0-preview.1` with package assets. The draft remains unpublished. Later ordinary PRs update the same rolling release notes. To publish another preview, prepare and merge another version PR:

```bash
./release-version.sh prepare-preview 0.1.0
```

This changes the committed version to `0.1.0-preview.2`.

### RC and stable promotion

```bash
./release-version.sh prepare-rc 0.1.0
# merge and validate version PR
./release-version.sh tag
git push origin v0.1.0-rc.1
```

After RC approval:

```bash
./release-version.sh prepare-stable 0.1.0
# merge and validate version PR
./release-version.sh tag
git push origin v0.1.0
```

Every tag must be created from the exact approved `main` commit. NBGV creates tags; Release Drafter publishes the matching release.

## Release checklist

### Preview

1. Run `./release-version.sh prepare-preview <major.minor.patch>`.
2. Open and merge the version PR.
3. Merge ordinary feature, fix, test, and documentation PRs.
4. Confirm CI publishes the preview package and updates the prerelease draft.

### RC or stable

1. Run `prepare-rc` or `prepare-stable`.
2. Open and merge the version PR.
3. Validate the exact `main` commit.
4. Run `./release-version.sh tag`.
5. Push the generated `v*` tag.
6. Confirm CI publishes the package and matching release.

## References

- [NBGV versioning workflow](https://dotnet.github.io/Nerdbank.GitVersioning/docs/versioning-workflow.html)
- [NBGV cloud build requirements](https://dotnet.github.io/Nerdbank.GitVersioning/docs/cloudbuild.html#requirements)
- [NBGV CLI](https://dotnet.github.io/Nerdbank.GitVersioning/docs/nbgv-cli.html)
