---
layout: default
title:  Flex Engine
tags: 3D, vulkan, opengl, graphics, engine, cpp, c++
permalink: /flex-engine/
author: AJ Weeks
---

## Flex Engine
###### 2017-Present

- C++, Vulkan, OpenGL

Flex Engine is a personal game engine I began work on in February 2017. I use it as a playground for learning about real-time techniques. You can find the source here: <a class="underline" href="https://github.com/ajweeks/FlexEngine"><i class="icon fa fa-github" aria-hidden="true" style="color: #222"></i> github.com/ajweeks/FlexEngine</a>

#### Notable Features
- Vulkan and OpenGL backends
- Signed-distance field font generation & rendering
- Physically based shading model
- Image based lighting
- Screen-space ambient occlusion
- Stable cascaded shadow mapping
- Conditional checksum-based shader compilation
- Scene editor with serialization
- Profiling tools
- In-game scripting language
- GPU particles (compute shader)

<a data-fancybox="gallery" href="/assets/img/flex_engine_banner_3.jpg"><img src="/assets/img/flex_engine_banner_3.jpg"  width="100%"></a>

<a data-fancybox="gallery" href="/assets/img/flex-engine-editor.png"><img src="/assets/img/flex-engine-editor.png"  width="100%"></a>
<span class="caption">A view of the editor tools showing info about scenes, objects, materials, lights, and user-settings</span>

<a data-fancybox="gallery" href="/assets/img/flex-engine-shadows.jpg"><img src="/assets/img/flex-engine-shadows.jpg"  width="100%"></a>
<span class="caption">Basic implementation of Cascaded Shadow Mapping</span>

<a data-fancybox="gallery" href="/assets/img/flex-gpu-particles.jpg"><img src="/assets/img/flex-gpu-particles.jpg"  width="100%"></a>
<span class="caption">Two million particles updated and rendered entirely on the GPU, utilizing the compute stage</span>

<a data-fancybox="gallery" href="/assets/img/flex-engine-profiler.jpg"><img src="/assets/img/flex-engine-profiler.jpg"  width="100%"></a>
<span class="caption">Profiler overlay showing a breakdown the CPU-time of a single frame</span>

<a data-fancybox="gallery" href="/assets/img/flex-editor-windows.jpg"><img src="/assets/img/flex-editor-windows.jpg"  width="100%"></a>
<span class="caption">Some of the editor windows</span>

<a data-fancybox="gallery" href="/assets/img/flex-ssao.png"><img src="/assets/img/flex-ssao.png"  width="100%"></a>
<span class="caption">Screen-Space Ambient Occlusion (SSAO)</span>

<a data-fancybox="gallery" href="/assets/img/flex-engine-gbuf.jpg"><img src="/assets/img/flex-engine-gbuf.jpg"  width="100%"></a>
<span class="caption">GBuffer (top-left to bottom-right): position, albedo, normal, final image, depth, metallic, AO, roughness</span>

 <a data-fancybox="gallery" href="/assets/img/flex-engine-guns-01.jpg"><img src="/assets/img/flex-engine-guns-01.jpg"  width="100%"></a>
 <a data-fancybox="gallery" href="/assets/img/flex-engine-guns-02.jpg"><img src="/assets/img/flex-engine-guns-02.jpg"  width="100%"></a>
 <a data-fancybox="gallery" href="/assets/img/flex-engine-guns-03.jpg"><img src="/assets/img/flex-engine-guns-03.jpg"  width="100%"></a>
<span class="caption">The effect different environment maps have on the same model when using image-based lighting</span>

<a data-fancybox="gallery" href="/assets/img/flex-engine-rotate.gif"><img src="/assets/img/flex-engine-rotate.gif"  width="100%"></a>

See more screenshots [here](https://github.com/ajweeks/FlexEngine/tree/development/FlexEngine/screenshots)

## Acknowledgments
A huge thank you must be given to the following individuals and organizations for their incredibly useful resources:
 - Baldur Karlsson of [github.com/baldurk/renderdoc](https://github.com/baldurk/renderdoc)
 - Alexander Overvoorde of [vulkan-tutorial.com](https://vulkan-tutorial.com)
 - Sascha Willems of [github.com/SaschaWillems/Vulkan](https://github.com/SaschaWillems/Vulkan)
 - Joey de Vries of [learnopengl.com](https://learnopengl.com)
 - Andrew Maximov for the pistol model and textures [artisaverb.info/PBT.html ](http://artisaverb.info/PBT.html)
 - [FreePBR.com](https://FreePBR.com) for the high-quality PBR textures
 - All authors and contributors to the open-source libraries mentioned above

## Blog
Stay (somewhat) up to date about this project on my blog at [ajweeks.com/blog](https://ajweeks.com/blog/)
