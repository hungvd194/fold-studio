# Phase 2 — Easy Mode

Status: IN PROGRESS on `phase-2-easy-mode`.

## Goal
A novice can choose a template, enter body dimensions, optionally decorate, and print/export without learning technical fold geometry. Advanced mode retains the existing complete controls and uses the **same design state**.

## First implementation
- Easy/Advanced mode switch; remembers mode in browser-local storage.
- Four-step beginner navigation: template → dimensions → decoration → print/export.
- Beginner-first presentation and reduced advanced control clutter.
- No change to physical dimensions or geometry calculations when switching modes.

## Acceptance checklist
- [ ] Easy mode exposes all controls required for a first successful design.
- [ ] Easy ↔ Advanced preserves template, dimensions, artwork, and paper settings.
- [ ] Step navigation is accessible with keyboard, mobile and screen readers.
- [ ] No technical terms or dead-end controls in beginner flow.
- [ ] All Node tests and browser smoke tests pass.
- [ ] New users complete the basic workflow without assistance.

Do not merge before these checks are complete.
