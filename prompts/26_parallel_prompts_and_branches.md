okay. now create 3 folders in prompts 27_DEVELOPER_A, 27_DEVELOPER_B, 27_DEVELOPER_C. add prompts related to
them from execution plan within each file in the folder.

Each file in each of the folder would correspond to the step

for example

27_DEVELOPER_A/27_1_execute_Step_31

and it would include instruction to execute step 31.

others are here

- Developer A: Steps 31-34 (Levels)
- Developer B: Steps 35-37 (Weapons)
- Developer C: Steps 38-40 (Environments)

Add hints for each developeer in each execution step how to avoid merge conflict.

create 2 branches on origin.

27_developer_b
27_developer_c

then do git fetch

then create 2 worktrees
git worktree  add ../27_developer_b 27_developer_b
git worktree  add ../27_developer_c 27_developer_c

this will allow agents to work in parallel