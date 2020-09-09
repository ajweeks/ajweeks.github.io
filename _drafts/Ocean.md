---
layout: post
title: "Ocean rendering"
date: 2020-04-08
tags: graphics programming, rendering, optimization, code, waves
permalink: /blog/:year/:month/:day/:title/
author: AJ Weeks
---

While implementing ocean rendering in my personal game engine, I thought I would aim to go through multiple iterations, progressively getting cheaper, to see the impact of various optimizations. In this case I care most about debug performance, which means I can't rely on things like auto-vectorization, and the standard library should be avoided as much as possible.

Because I, regrettably, tend to use the standard library quite a bit in my engine, calls to it are a prime source of low-hanging optimization fruit.

My plan was to take the following steps:

1. Naieve single-threaded CPU implementation
2. Optimizing by reducing calls into std functions (replace vector indexing with pointer arithmetic)
3. Basic SIMD expansion (SSE.1)
4. Fork-join multithreading
5. GPU compute shader
6. GPU mesh shader

The first implementation was fairly straightforward, I just had to generate a list of vertices that make a quad and an index list that connect them, and then drive the positions using a gerstner function. This approach quickly reached performance limitations. My baseline cost for one frame of computation was ___90ms___.

Reducing calls into the standard library functions can make a massive difference in a tight inner loop, in this case bringing the cost down XX%, down to ___80ms___.

At this point, I decided to dip my toes into SIMD programming, after hearing about it a fair bit. Once you understand the basic operations, SSE.1 is very straightforward, if a bit ugly. The performance of the code is traded off for a good portion of its readability. If you're not aware, SIMD, or Single Intruction Multiple Data, is a way of operating on multiple values at the same time, on the CPU instruction level. Your CPU has the ability to do this, so not taking advantage of it is leaving essentially free performance on the table.
