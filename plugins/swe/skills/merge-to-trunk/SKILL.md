---
name: merge-to-trunk
description: Shared core of the merge recipe that merges a worktree branch on main while main is checked out in the root worktree. Invoked by the repository's own merge-to-trunk skill; do not invoke directly.
user-invocable: false
---

# Merging a worktree branch to main, shared core

If you reached this skill by invoking `swe:merge-to-trunk` yourself, stop and invoke the repository's
`merge-to-trunk` skill instead; it invokes this one and holds the repository's own rules.

This is the shared core; the repository's own skill of the same bare name holds its overlay and was read
before this.

The setup this recipe assumes: `main` is checked out in the root worktree, agents work in nested worktrees
that cannot check it out, and `receive.denyCurrentBranch updateInstead` is set, so a push updates the root
worktree's files as well as the ref.

## 1. Set up once, in the root checkout

```bash
git config receive.denyCurrentBranch updateInstead
```

Without it, step 3 below is refused. With it, a push into the checked-out branch updates the working tree
too, and refuses when that tree is dirty. The recipe relies on that refusal as its guard.

## 2. Preconditions

- **The checks required by the diff must pass in your worktree first.** A diff of documents alone takes the hook's
  required checks. A diff of ordinary code takes the unit suite plus every integration file whose subject the diff
  reaches. A diff that touches boundary code, and every phase merge, takes the required phase checks. The overlay
  names the commands.
- **A narrower run than the diff picks is justified in the merge message.** An unexplained narrower run
  counts as no run.
- **Every merge needs the human principal's explicit go, given immediately before, in answer to the reported required checks, naming
  this merge.** Only the principal can authorise a merge with something failing. An earlier instruction such as
  "finish it off" is not merge approval; if that is all you hold, stop and ask. Do not run the recipe
  without the go.
- **Merge with a merge commit, never a squash**, because a merge commit keeps bisection working and shows
  the branch as it was. The cost is that a rollback takes two deliberate steps: `git revert -m 1
  <merge-sha>`, and to merge the work again, `git revert <the-revert-sha>` or a rebase onto the revert. A
  plain second merge does nothing, because git considers the branch already merged. If you intend to merge
  again after a rollback, decide that first and record the revert's hash.

## 3. The recipe

Run each line as its own command; a compound command hides which step failed.

```bash
# 1. Merge main INTO your branch first. Not optional.
git merge main

# Record main's hash before you move it, so you can diff against it after the push.
OLD_MAIN=$(git rev-parse main)

# 2. Build the merge commit: first parent main, second parent your branch. It is the same object
#    `git merge --no-ff` would make, without main checked out.
git commit-tree "HEAD^{tree}" -p main -p HEAD -F <message-file>

# 3. Push it. With updateInstead this also updates the root worktree's files.
git push . <sha-from-step-2>:refs/heads/main

# 4. Push main to the remote, if there is one.
git push origin main
```

- **Step 1 stops you from silently reverting somebody else's work, and skipping it fails silently.**
  `commit-tree` commits the tree you hand it, exactly, and asks nothing. If `main` has moved since you
  branched, `HEAD^{tree}` has never seen the new commit, and the push makes `main` point at content where
  that change no longer exists. Git reports success with no conflict and no warning. A real `git merge`
  would have refused or conflicted, and skipping step 1 bypasses that.
- **For a guarantee, check before the push:** `git merge-base --is-ancestor main HEAD` exits 0 only when
  your branch contains `main`.
- **Never replace step 1 with `git push . HEAD:main`**, which fast-forwards and makes no merge commit.
- **Never move `main` with `git update-ref`.** It moves the ref and leaves the root worktree's files at the
  old content, so whoever sits there sees your whole branch as uncommitted reversals.
- **Git runs `pre-merge-commit`, not `pre-commit`, for a merge that makes a commit.** The repository's
  `pre-merge-commit` runs the same required checks, so step 1's merge is checked in the worktree that makes it.
  `commit-tree` in step 2 runs no hook, and the tree it commits is the tree step 1 checked.
- **The merge message names the required checks you ran, the branch and the commit it merges, and the approval**: who
  gave it and when, naming this merge.

## 4. If the push is refused

"Up-to-date check failed" means the `updateInstead` guard fired, which is the guard working and not a
problem to route around. Somebody has uncommitted work or an unfinished merge in the root checkout. Find
out whose before you touch anything, and do not force past it.

## 5. After the push, verify the root checkout, every time

`updateInstead` protects the common case, not every case: it can report success over an abandoned merge
already in the root checkout. **Someone who can see the root checkout confirms it is clean, before and
after.** An isolated session cannot check this itself, by design, because the harness blocks git against
another worktree.

```bash
git status --short                                    # empty
git rev-parse -q --verify MERGE_HEAD || echo "clean"  # no merge in progress
git log --oneline -1                                  # the hash you just pushed
```

- **If `MERGE_HEAD` resolves, somebody is mid-merge there.** Find out whose before you do anything.
  `git merge --abort` is safe, because it keeps every commit and the merge can be done again, but ask
  first.
- **Diff the old `main` against the new head** (`git diff --stat $OLD_MAIN main`). It must show only the
  files your branch changed. A deletion or reversal you did not make means `main` moved between step 1 and
  step 2, and your tree never saw that commit. Merge that commit into your branch and push a corrective
  merge.

## 6. If the merge touches the package manifests or the lockfile

- **Say so when you announce the merge, and run the workspace install the overlay names in the root
  checkout.** Worktrees resolve installed packages upward to the root, so a dependency the root lacks is
  missing for every worktree that has not installed its own. The hook cannot catch this: it builds in the
  worktree that added the dependency, the one place the package is sure to exist.
- **Every worktree that merges `main` runs the same install afterwards**, because the required commit checks on that
  merge resolve packages from the worktree that makes it.
