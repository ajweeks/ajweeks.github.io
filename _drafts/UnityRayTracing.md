---
layout: post
title: "Ray Tracing in Unity's HDRP"
date: 2020-04-08
tags: ray tracing, unity
permalink: /blog/:year/:month/:day/:title/
author: AJ Weeks
---

<!-- <a data-fancybox="gallery" href="/assets/img/ssao-final-01.jpg"><img width="100%" src="/assets/img/ssao-final-01.jpg" /></a> -->

Unity recently added support for Ray Tracing in their High Definition Render Pipeline (HDRP), however there is no documentation for how to use it, so I thought I would collect some notes here that I learnt while experimenting with it for anyone wanting to give it a go.

This post was written for **HDRP 7.2.1** and **Unity 2019.3**. These steps **will not work** if you are using a different version! This API is very young and is almost guaranteed to change quickly. I'm using JetBrains Rider as my code editor, but any will work.

/warn
All things considered, I would not recommend using Ray tracing in Unity at this point. However, if you still want to, or like in my case need to because your project was already in Unity, then hopefully these steps and troubleshooting tips will help.

##Prerequisites
* RTX-compatible graphics card (Pascal (10X0), Turing (20X0), or Volta (Titan X) generation)
* Basic understanding of Unity

Starting from a fresh project, before doing anything else, we need to let Unity know that we want to trace some rays. First we have to set the graphics API to D3D12 via Edit > Project Settings > Player > Other Settings. Disable Auto Graphics API for Windows, and add D3D12. Drag D3D12 it to the top of the list, and give the editor a restart. With the Player settings still open you should also disable Static Batching at this point.

We can then modify the auto-generated HDRP Render Asset that is in the Settings directory. In the Rendering section we'll enable Realtime Raytracing. If you see a warning appear, that means your device doesn't support RTX, if you think it should then you're either confused or didn't follow the previous step.

Then you can create a new shader by right clicking in the project windows and under Create > Shader > Ray Tracing Shader.

To dispatch rays we'll use a [Custom Pass](https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@7.2/manual/Custom-Pass.html). Create a new C# script called `RayDispatchPass.cs`. We'll want to remove most of the automatically added code, and make the class inherit from `CustomPass`. We then need to override the following function:

`protected override void Execute(ScriptableRenderContext renderContext, CommandBuffer cmd, HDCamera hdCamera, CullingResults cullingResult)`

It's in here that we will dispatch our ray generation shader.

```cs
public RayTracingShader ReflectionShader;

protected override void Execute(ScriptableRenderContext renderContext, CommandBuffer cmd, HDCamera hdCamera, CullingResults cullingResult)
{
    if (ReflectionShader == null)
    {
        return;
    }

    uint width = (uint) Screen.width;
    uint height = (uint) Screen.height;
    uint depth = 1u;

    cmd.DispatchRays(ReflectionShader, "RayGenReflection", width, height, depth);
}
```

Here I'm dispatching a ray generation shader per pixel on the screen. To start each one will trace one ray.

We'll then create a new scene and add an empty game object. We'll add a Custom Volume Pass component and add our RayDispatchPass. We'll fill in the Reflection Shader variable, referencing our ray trace shader. To have some geometry to look at I downloaded and added to the scene the classic Sponza model from [here](https://github.com/jimmiebergmann/Sponza). By default it will be scaled up something massive so you'll want to change the import scale to 0.01 and then click apply.

Lets next add another custom pass which will take the ray traced results and apply them to the frame buffer, I'll call mine `FullScreenCompositePass`. Go through the same steps as above, but this time when adding it as a pass to the custom pass volume set the Render Order to After Opaques.

Instead of dispatching rays, this shader will draw a fullscreen quad which will run a pixel shader that samples the existing frame buffer as well as the raytraced reflections buffer, then composite them and return the result.

Then we'll add a new unlit shader called FullScreenCompositeShader. We can right click that and create a new material which uses it called a FullScreenCompositeMat.

In the shader we'll give our one and only pass a name, `Pass "Full Screen Composite"` inside the Pass block. We can create another custom pass volume component on the same object as before, then add a FullScreen Custom Pass. We can then drag the material into the slot and select our custom pass. We can then set the second custom pass to run `Before Post Process`

We also have to bind the AccelerationStructure, which we can do with

```
HDRenderPipeline hdrp = (RenderPipelineManager.currentPipeline as HDRenderPipeline);
RayTracingAccelerationStructure accelerationStructure = hdrp.RequestAccelerationStructure();

cmd.SetRayTracingAccelerationStructure(ReflectionShader, HDShaderIDs._RaytracingAccelerationStructureName, accelerationStructure);
```
Unfortunately in its current state I couldn't find a way to access this without modifying the HDRP package directly. This is undesirable for several reasons, including that we may accidently lose our change when we upgrade or have to reimplement it around the changes. In this case I'm just going to modify the package cache version knowing that it will have to be redone if I update or for some reason delete my Library directory.

Specifically I had to make `RequestAccelerationStructure` & `HDShaderIDs` public.



For the most up-to-date Unity Raytracing reference, see https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@7.2/manual/Ray-Tracing-Getting-Started.html (switch the version to the version you are using)

Here's a few potential gotchas I found out the hard way:
* Don't connect Render Doc! It will prevent the acceleration structure from being created
  * This is unfortunate as Render Doc is an invaluable tool as a graphics programmer, however this API appears to be too new to have gotten support for it
#pragma test ?
#define SHADOW_LOW
RayTracingAccelerationStructure
SetRayTracingShaderPass: Light mode & pass name needed?
	Object in the scene with a custom shader with that pass needed?
		-> No, I think because I dispatch my own rays rather than from a pixel/vertex shader
Custom pass volume injection point (to avoid unable to access acceleration structure)
FrameSettingsField.RayTracing
Args to TraceRay? -> (AS, RAY_FLAGS, RAYTRACINGRENDERFLAG, ?, ?, ?, desc, intersection)
TMax ? (len of ray, or 1.0?)
Bias values?
Init rayIntersection.color?

Ray Tracing Shader (RayTracedReflections): Property (RenderTarget) is not set. Dispatching ray generation shader (RayGenReflection) failed!
