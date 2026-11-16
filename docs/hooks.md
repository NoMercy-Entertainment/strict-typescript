# Git hooks

`npx strict-typescript hooks install` sets `core.hooksPath` to a `.githooks` folder in the project and writes two hooks there.
Commit the `.githooks` folder. After a fresh clone, run `npx strict-typescript hooks install` once.

If `core.hooksPath` already points somewhere, the hooks go into that folder and the setting stays.

## commit-msg

The hook refuses a commit message that carries an attribution trailer.
It matches the trailer anywhere in the message, in any casing and with any spacing:

- `Co-Authored-By:`, `Co authored by:`, `Coauthor:` and similar spellings.
- `Claude-Session:`.
- `Generated with Claude`.

Comment lines are ignored, because git discards them.
The hook exits 1 and prints the lines it matched. A clean message passes.

## pre-push

The hook runs `npm run lint` and `npm run typecheck` on the commit you push, before the push leaves your machine.

1. It reads the pushed commit from git's input.
2. It checks that commit out in a separate worktree at `.git/strict-typescript-gate`. Unfinished work in your working tree never blocks a push of finished commits.
3. It installs the packages in that worktree: `npm ci` when there is a `package-lock.json`, else `npm install`. It installs again only when the lockfile hash changes.
4. It runs `npm run --if-present lint`, then `npm run --if-present typecheck`. A missing script is skipped.
5. A failing script blocks the push with `lint failed, push blocked` or `typecheck failed, push blocked`.

To skip the gate for one push, for example when CI is the thing you are fixing:

```sh
STRICT_TS_SKIP_PREPUSH=1 git push
```

To remove the gate worktree, run `git worktree remove --force .git/strict-typescript-gate`.
It does not hold a link to your `node_modules`.

## Hooks you already have

`hooks install` keeps a hook that was there before and runs it too.

- A hook in the hooks folder is renamed to `<hook>.local`.
- A hook in `.git/hooks`, which `core.hooksPath` would otherwise hide, is copied to `<hook>.local`.

`commit-msg` runs its check first and then `commit-msg.local`. A failure in either blocks the commit.
`pre-push` runs `pre-push.local` first, then the gate. Both see git's input.
Running `hooks install` again updates the two hooks and leaves the `.local` files alone.

## Uninstall

```sh
npx strict-typescript hooks uninstall
```

It removes the two hooks and renames each `<hook>.local` back to `<hook>`.
It deletes a `.local` copy that came from `.git/hooks`, because that original is still in place.
It unsets `core.hooksPath` only when `hooks install` set it, and removes the `.githooks` folder when it is empty.
