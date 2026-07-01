---
layout: post.njk
title: "Barriers to a Prosperous Future"
date: 2026-05-22
lang: en
tags:
  - post
  - selected
  - machine learning
  - society
  - artificial intelligence
  - ai
description: "On the risks posed by rapid development of advanced AI systems"
---

The current race towards producing general artificial intelligence systems brings with it severe risks, yet no AI company developing frontier models is addressing these risks at a level proportional to the pace of development. The rapid integration of this poorly-understood technology into nearly all aspects of society is precarious at best, and catastrophic at worst. If progress trends continue, we will need a monumental level of investment in enhancing our robustness to these risks in the coming years. What follows is a summary of my understanding of these risks, a description of those most concerning to me, and finally what my personal plans are to mitigate them.

### Types of Risk

It can be useful to categorize risks from advanced AI into three broad categories: **misuse**, **misalignment**, and **systemic**. Misuse refers to malicious actors—individuals, groups, or states—being enabled by AI systems to achieve nefarious objectives, by, for example, generating personalized misinformation at scale, hacking their adversaries' critical infrastructure, or building powerful weapons. Misalignment refers to AI models failing to truly obtain human values, leading to unpredictable and undesirable behaviours in out-of-distribution environments. Finally, systemic risks are those that arise from our complex and vital societal systems becoming dependent on a technology which we don't fully understand nor control, leaving us vulnerable to their unpredictable interactions.

Even AI researchers themselves understand shockingly little of how frontier AI systems reason and make decisions, and the rate of progress in this area is worryingly slow compared to the pace of development of AI capabilities, which is currently estimated to be doubling every four months [^metr].

As for "aligning" models with human values, the best techniques these multi-billion dollar companies have developed are fundamentally surface-level and have, without exception, failed in various ways, including being bypassed by clever prompting, also known as "jailbreaking". Some worrying behaviours were discussed in Anthropic's own recent report on [Agentic Misalignment](https://www.anthropic.com/research/agentic-misalignment). If we are to entrust critical parts of our society such as education, healthcare, cyber security, and political advising to these systems, the emerging sciences of alignment and control will play a crucial role in doing so safely.

### Gradual Disempowerment

While the categories of misuse and misalignment are slowly gaining attention in public discourse, government, and academic research, in my view the most complex category, systemic risks, is currently largely neglected. Risks in this category can be subtle, developing quietly in the background, their consequences first becoming apparent when large parts of society are already dependent on these systems, by which point a large amount of the damage may already be done. Many of our critical societal systems are already complex (e.g., economies, governments, healthcare) and have been tuned over many decades to function robustly. The rapid interweaving of AI into these systems may make them harder to control and predict and lead to unintended consequences such as a reduction in human empowerment. A line of reasoning within this category that I find particularly concerning is known as **gradual disempowerment**, which refers to the incremental loss of human influence as a result of having more competitive machine alternatives to humans in almost all societal functions.

In the original work that introduced the term [^gradual-disempowerment], the authors argue that as AI systems begin to represent ever larger shares of the labour market we might expect the economic role humans play to be reduced, and in turn so too the economic power they hold. Unlike with previous automation where humans could transition from more narrow to more complex work, AI threatens to claim all cognitive tasks, leaving humans with no higher, more cognitively-demanding roles to move to. Without labour, money will by default cease to flow to most individuals, potentially leading to drastically increased wealth inequality. Further, they argue, the economy has always been roughly tied to human preferences, where businesses only survive when they have a paying customer base. In an AI-driven economy, this tie may loosen significantly, leading to markets that cater to those systems, rather than to human values and preferences.

Additionally, they argue that as advanced AI systems become integrated into the creation and consumption of cultural artifacts, we could see our cultural norms be significantly disrupted, in a similar way to content creators today catering to "the algorithm", but amplified greatly. While previous cultural practices have always had an evolutionary pressure to in some way benefit humans, in a world where humans are no longer the only producer and consumer of culture, this "antibody" effect may be lessened, leading to potentially maladaptive cultural practices. Additionally, the apparently alluring promise of always-available hyper-personalized AI therapy, coaching, and even companionship could begin to outcompete humans, even if objectively lower quality and lacking emotional depth, simply due to the ease of access and adaptability of such systems. 
For a more in-depth discussion of this topic, see Kulveit et al. 2025 [^gradual-disempowerment].

### Rate of Development

How much time should we expect to have to solve these problems? One important factor to consider is that AI companies are likely to invest heavily in improving their models' abilities to carry out autonomous AI research, given the immense potential economic value of doing so [^situational-awareness]. Even if progress is initially impeded by bottlenecks like model unreliability, human approval, and limited compute and energy, the incentives to unblock these will be so great that before long we should expect solutions to be found. Frontier AI companies are well aware of the bottlenecks to their growth trajectories, and are working hard to pave the path towards training models that are orders of magnitude larger and more capable than today's [^stargate].

This dynamic, known as "recursive self-improvement"—AI systems tasked with improving themselves—is already happening to some degree today, and it is likely to lead to an ever-accelerating rate of development of AI capabilities as more capable models provide ever-stronger "uplift" to human researchers. If models surpass the threshold of being capable of operating largely autonomously—that is, producing hypotheses, developing efficient tests of those hypotheses, and analyzing the results to make iterative improvements to themselves—we might experience an "intelligence explosion", wherein countless digital minds running 24/7 at superhuman speeds—a "country of geniuses in a datacenter" [^machines-of-loving-grace]—drive rapid progress in AI research, on a timescale we couldn't hope to keep up with. For further discussion on this topic, see Forethought's [Three Types of Intelligence Explosion](https://www.forethought.org/research/three-types-of-intelligence-explosion).

For the above reasons, there is a real chance that AI systems with human-level capabilities across all fields, often referred to as artificial general intelligence, or AGI, could be developed within the coming 5–10 years, with many estimates from AI researchers and forecasting experts converging around the year 2033 [^metaculus] [^80k]. While previous technological revolutions developed at a pace that allowed humanity to gradually adapt laws, cultural norms, and education over the span of decades, the rate of change we can expect in an AI-powered future will be entirely unprecedented and force a significant reorganization of many parts of society, possibly in an astoundingly short timeframe. Therefore, it is imperative that we greatly increase investment in fortifying all parts of society.

### Mitigations

In order to strengthen our defenses against these risks, we will need to devote historic amounts of capital and effort in the coming years. We will need thorough and continuous measurement of our reliance on AI systems to have metrics to guide discourse and to use as a basis for enacting critical policy. Additionally, we will need to conduct research on how we can use AI systems in a sustainable way that benefits us in the long run.

To this end, we greatly need more research organizations like Epoch AI, [measuring and forecasting AI progress](https://epoch.ai/blog), and METR, conducting in-depth research such as that described in their [Frontier Risk Report](https://metr.org/blog/2026-05-19-frontier-risk-report). Crucially, we additionally need much more research examining the usage and impact of AI on all parts of society, such as the [Anthropic Economic Index](https://www.anthropic.com/research/economic-index-primitives), communicated widely.

Furthermore, we need to build tools that will make our society more resilient to shocks resulting from the integration of AI. Beyond these tools and improved alignment methods that enable training models that robustly behave in pro-human ways, such as refusing to display shallow imitations of affection, we will also need significant international regulation. AI legislation has to a large degree thus far focused on present-day harms such as deepfakes and disinformation [^eu-ai-act]. What's needed on top of this is legislation that specifically mitigates disempowerment.

<details>
  <summary><i>Can't we just pause development of frontier AI?</i></summary>

While some argue for a global pause on or a mandated deceleration of frontier AI system development (such as [Pause AI](https://pauseai.info)), I personally believe such a pause is likely very difficult to achieve, and could potentially even [backfire](https://forum.effectivealtruism.org/posts/JYEAL8g7ArqGoTaX6/ai-pause-will-likely-backfire) as a result of pushing AI development underground to actors less concerned with safety and who would withhold progress from the public. That said, I fully support initiatives that aim to coordinate between frontier AI companies to slow down the most dangerous research on self-improving systems.

</details>
<br />

The challenges ahead are great, but so too are the potential upsides. We still have time to act to prevent the worst outcomes, but the window may be closing and much work is needed.

What follows is my personal plan, given the context above.

---

## My Plans

My current plan is to contribute to mitigating the above risks in three primary ways: developing my ability to conduct technical research, fostering a local AI safety community, and exploring potential mitigations to gradual disempowerment risks.

Firstly, I will greatly develop my understanding of technical AI safety in the coming months in order to get a deeper awareness of the best tools we have developed for understanding and controlling frontier models. This is where I can best leverage my career experience, though my long-term focus may shift after this period.

Secondly, I plan to continue facilitating and growing a thriving local community of concerned individuals in order to spread knowledge, enable networking, and gather a wide array of perspectives. [^stockholm-ai-safety]

Finally, I plan to explore the ways I can contribute to building mitigations against disempowerment. This project may initially be developed either during a fellowship or independently. Some preliminary ideas include: building trustworthy open-source coordination tools for both humans and AIs or developing further the ideas proposed in Gradual Disempowerment, focusing on other societal systems. If promising, I can imagine founding a research organization that would work to further develop these mitigations.

*Last updated: 2026-06-08*

[^metr]: METR: [Time Horizons](https://metr.org/time-horizons/)
[^gradual-disempowerment]: Kulveit et al.: [Gradual Disempowerment](https://gradual-disempowerment.ai), January 2025
[^situational-awareness]: Situational Awareness, Leopold Aschenbrenner: [From AGI to Superintelligence: the Intelligence Explosion](https://situational-awareness.ai/from-agi-to-superintelligence/)
[^stargate]: OpenAI: [Stargate](https://openai.com/index/stargate-community)
[^machines-of-loving-grace]: Dario Amodei: [Machines of Loving Grace](https://www.darioamodei.com/essay/machines-of-loving-grace/)
[^metaculus]: Metaculus: [When will the first general AI system be devised, tested, and publicly announced?](https://www.metaculus.com/questions/5121/when-will-the-first-general-ai-system-be-devised-tested-and-publicly-announced/)
[^80k]: 80,000 Hours: [When will AGI arrive?](https://80000hours.org/ai/guide/when-will-agi-arrive/)
[^eu-ai-act]: [EU AI Act](https://artificialintelligenceact.eu/)
[^stockholm-ai-safety]: [Stockholm AI Safety](https://www.meetup.com/stockholm-ai-safety/)
