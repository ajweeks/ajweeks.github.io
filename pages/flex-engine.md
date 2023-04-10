---
layout: default
title:  Flex Engine
tags: 3D, vulkan, opengl, graphics, engine, cpp, c++
permalink: /flex-engine/
author: AJ Weeks
---

## Flex Engine
###### 2017-Present

- C++, Vulkan

Flex Engine is a personal game engine I began work on in February 2017. I use it as a playground for learning about real-time techniques. You can find the source here: <a class="underline" href="https://github.com/ajweeks/FlexEngine"><i class="icon fa fa-github" aria-hidden="true" style="color: #222"></i> github.com/ajweeks/FlexEngine</a>

#### Notable Features
- Vulkan backend
- Conditional checksum-based shader compilation
- Support for Windows & linux
- Scene editor with serialization
- In-game scripting language & virtual machine
- Built-in profiling capture/inspection tools
- Rendering:
  - Physically based shading model
  - Image based lighting
  - Screen-space ambient occlusion
  - Stable cascaded shadow mapping
  - Temporal anti-aliasing
  - Signed-distance field font generation & rendering
  - GPU particles

<a data-fancybox="gallery" href="/assets/img/flex-engine-banner-03.webp"><img src="/assets/img/flex-engine-banner-03.webp" width="960"></a>

<a data-fancybox="gallery" href="/assets/img/flex-engine-editor.webp"><img src="/assets/img/flex-engine-editor.webp" width="960" loading="lazy"></a>
<span class="caption">A view of the editor tools showing info about scenes, objects, materials, lights, and user-settings</span>

<a data-fancybox="gallery" href="/assets/img/flex-engine-shadows.webp"><img src="/assets/img/flex-engine-shadows.webp" width="960" loading="lazy"></a>
<span class="caption">Basic implementation of Cascaded Shadow Mapping</span>

<a data-fancybox="gallery" href="/assets/img/flex-gpu-particles.webp"><img src="/assets/img/flex-gpu-particles.webp" width="960" loading="lazy"></a>
<span class="caption">Two million particles updated and rendered entirely on the GPU, utilizing the compute stage</span>

<a data-fancybox="gallery" href="/assets/img/flex-engine-profiler.webp"><img src="/assets/img/flex-engine-profiler.webp" width="960" loading="lazy"></a>
<span class="caption">Profiler overlay showing a breakdown the CPU-time of a single frame</span>

<a data-fancybox="gallery" href="/assets/img/flex-editor-windows.webp"><img src="/assets/img/flex-editor-windows.webp" width="960" loading="lazy"></a>
<span class="caption">Some of the editor windows</span>

<a data-fancybox="gallery" href="/assets/img/flex-ssao.webp"><img src="/assets/img/flex-ssao.webp" width="960" loading="lazy"></a>
<span class="caption">Screen-Space Ambient Occlusion (SSAO)</span>

<a data-fancybox="gallery" href="/assets/img/flex-engine-gbuf.webp"><img src="/assets/img/flex-engine-gbuf.webp" width="960" loading="lazy"></a>
<span class="caption">GBuffer (top-left to bottom-right): position, albedo, normal, final image, depth, metallic, AO, roughness</span>

 <a data-fancybox="gallery" href="/assets/img/flex-engine-guns-01.webp"><img src="/assets/img/flex-engine-guns-01.webp" width="960" loading="lazy"></a>
 <a data-fancybox="gallery" href="/assets/img/flex-engine-guns-02.webp"><img src="/assets/img/flex-engine-guns-02.webp" width="960" loading="lazy"></a>
 <a data-fancybox="gallery" href="/assets/img/flex-engine-guns-03.webp"><img src="/assets/img/flex-engine-guns-03.webp" width="960" loading="lazy"></a>
<span class="caption">The effect different environment maps have on the same model when using image-based lighting</span>

<a data-fancybox="gallery" href="/assets/img/flex-engine-rotate.webp"><img src="/assets/img/flex-engine-rotate.webp" width="960" loading="lazy"></a>

See more screenshots <a class="underline" href="https://github.com/ajweeks/FlexEngine/tree/development/FlexEngine/screenshots">here</a>

## Acknowledgments
A huge thank you must be given to the following individuals and organizations for their incredibly useful resources:
 - Baldur Karlsson of <a class="underline" href="https://github.com/baldurk/renderdoc">github.com/baldurk/renderdoc</a>
 - Alexander Overvoorde of <a class="underline" href="https://vulkan-tutorial.com">vulkan-tutorial.com</a>
 - Sascha Willems of <a class="underline" href="https://github.com/SaschaWillems/Vulkan">github.com/SaschaWillems/Vulkan</a>
 - Joey de Vries of <a class="underline" href="https://learnopengl.com">learnopengl.com</a>
 - Andrew Maximov for the pistol model and textures <a class="underline" href="https://artisaverb.info/PBT.html">artisaverb.info/PBT.html</a>
 - <a class="underline" href="https://FreePBR.com">FreePBR.com</a> for the high-quality PBR textures
 - All authors and contributors to the open-source libraries mentioned above

## Blog
Stay (somewhat) up to date about this project on my blog at <a class="underline" href="https://ajweeks.com/blog/">ajweeks.com/blog</a>
