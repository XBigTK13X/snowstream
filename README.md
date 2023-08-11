# snowstream

Snowman's streaming solution

Open Source all in one self-hosted media streaming solution.

# Motivation

There is a large swath of projects that work together to provide a media streaming setup. However, customizing them can be daunting since the tools are so fragmented. I initially started snowstream because I needed to customize Jellyfin and half a dozen other programs to acheive the feature set I was looking for. This included at least 6 different languages and project structures. I just wanted something simpler.

# Feature development progress

Check the [progress tracker on the WIKI](https://github.com/XBigTK13X/snowstream/wiki/Feature-Progress-Tracker) during the early days of this project. Eventually this will move to issues/projects.

## Why not use X?

Before I list these out, let me say that I have the upmost respect for each of the teams maintaining these projects. These pieces of software didn't fit my workflow, but are great on their own. If it isn't listed here then it was either abandonware or I just didn't know about it.

|Software|Functionality|Reason|
|--------|-------------|------|
|Threadfin|IPTV|UI is incredibly buggy. Lots of changes get lost. Obtuse behaviors leading to channels getting disabled. Unexpected CPU spikes|
|ErsatzTV|PseudoTV|Convulated workflow to eventually get streaming URLs. Project structure is difficult to develop on Linux. Another CPU spike source.|
|guide2go|Schedules Direct|Mostly worked great. However, the CLI just dumps a bunch of files and you need to map them to containers. I just wanted a simple API to get the EPG data.|
|Plex|Streaming|Closed Source|
|Emby|Streaming|Closed Source and fragile. It seemed like every stable release broke my library in new and exciting ways|
|Jellyfin|Streaming|Well supported by the community, but inherited a lot of Emby's technical debt. Also introduced strange bugs in my library over each release. I made around a dozen patches to various Jellyfin projects before deciding it was too messy to bother contributing. Eats RAM for breakfast.|
