# .ai

Working area for AI-assisted development (README §68).

```
skills/     reusable task playbooks — SKILL.md + templates/ + examples/ + checks/
tasks/      per-issue context packs
reviews/    independent review notes
handoffs/   state passed between agents or sessions
```

`AGENTS.md` at the repository root is the normative rule set for any agent. This
directory holds working material, not rules.

Local scratch files matching `local-*` are gitignored: they are session state, not
repository state.

## Skills planned (README §68)

Each skill is a playbook for one recurring kind of change, containing a `SKILL.md`,
templates, worked examples and executable checks:

```
architecture-change    api-feature           domain-feature        financial-formula
financial-product      provider-integration  payment-feature       workflow-feature
database-migration     security-review       privacy-review        mobile-feature
web-feature            desktop-feature       lambda-function       eks-workload
queue-consumer         temporal-workflow     ai-feature            model-evaluation
incident               release               dependency-upgrade    performance
recovery-test
```

None are written yet. They are most useful once there is real code to encode patterns
from — a playbook written before the first instance of the task tends to describe an
imagined workflow rather than the real one.
