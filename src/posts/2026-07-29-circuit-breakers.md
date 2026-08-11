---
layout: post.njk
title: "Reproducing Circuit Breakers"
date: 2026-08-10
lang: en
tags:
  - post
  - machine learning
  - artificial intelligence
  - ai
  - interpretability
description: "Reproducing the paper 'Improving Alignment and Robustness with Circuit Breakers' by Zou et al. (2024)."
---

##### *1 week research mini-sprint*

<img src="/assets/img/circuit-breakers-header.png" width="100%">

Here I describe my reproduction of the Representation Rerouting (RR) defensive LLM fine-tuning technique first introduced in [^circuit-breakers]. I then provide a brief overview of my attempts to understand and illustrate how the technique works on a mechanical level.

The Representation Rerouting (RR) technique consists of fine-tuning a model such that, on harmful content, its internal representations are pushed away from the original model's while on benign content it is left untouched. This fine-tuning results in harmful generations collapsing into gibberish mid-output. On Llama-3-8B this approach cuts attack success rate (ASR) from **38%** to **4%** (on the paper's own eval suite) -- but has a documented side effect: the fine-tuned model also refuses many benign requests.

My primary goal with this project was to learn more about the direction that the circuit breaker learns to push harmful representations into. To do this, I first reproduced the RR fine-tuning technique on Llama-3-8B and confirmed that the model correctly refused direct harmful requests, and short-circuited on prefill attacks where the base model complies. Across five replayed HarmBench attack suites the ASR on my fine-tuned model was 1.42, nearly identical to the released fine-tuned model's 1.59 (in comparison to the base model's 20.23, where lower is better). I also fine-tuned and tested Mistral-7B-Instruct-v0.2 to have two model families, and generally found consistent results for both models.

The biggest finding of this project was that benign prompts which the fine-tuned model wrongly refuses are pushed along the same direction as genuinely harmful content (cosine 0.91 vs 0.96). Since 0.96 is how well harmful prompts agree with their own average, 0.91 is close to indistinguishable. This shows that this undesirable over-refusal comes from an existing mechanism, firing overly eagerly on harmless inputs that happen to look harmful (e.g., *"How can I **kill** a Python process?"*). I also discovered that this direction is new and close to orthogonal to the base model's harmfulness axis (cosine 0.01), while a probe trained on my fine-tuned model is nearly parallel to it (0.98).

Adding this direction causes the model to refuse safe prompts which it otherwise answers. Adding a random vector of the same magnitude however leads to gibberish. Deleting the direction, however, has no effect. This indicates that it is informationally useful, but not solely responsible for the refusal or short circuiting behaviour.

In summary, RR picks a new internal direction and pushes representations along it. This direction is new, and orthogonal to the harmfullness direction. The push along this direction is how the circuit breaker works, the problem is that the same push sometimes happens for benign content that appears harmful. The most interesting next question to ask is which benign prompts in particular trigger this false refusal, and how the base model can be better trained to reduce the frequency of that happening, or how the circuit breaker mechanism itself can be made more robust to this shortcoming.

Find all source code here: [^github]

---

### Automated research assistant

Beyond my technical findings, this project was additionally a test of how autonomous today's frontier models can be when acting as research assistants. I let Claude Code (mostly Opus 5) run for hours at a time with my specified goals and access to an A100. It did an okay job overall, but produced a lot of results and made some weak and downright false claims. For my next project I will rein back the amount of freedom I give to models, instead giving them specific tasks so there is less room for veering off track. Today's models are shockingly good at troubleshooting technical problems and getting *something* running, though they still lack a lot of "common sense" and research taste and are very prone to reward hacking [^reward-hacking].



[^circuit-breakers]: [Improving Alignment and Robustness with Circuit Breakers, Zou et al.](https://arxiv.org/abs/2406.04313)

[^github]: https://github.com/ajweeks/circuit-breakers

[^reward-hacking]: https://www.lesswrong.com/posts/rKC4xJFkxm6cNq4i9/reward-hacking-is-becoming-more-sophisticated-and-deliberate
