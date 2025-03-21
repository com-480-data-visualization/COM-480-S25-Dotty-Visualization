# Dotty (Scala 3) Compiler Visualization Report

Project of Data Visualization (COM-480 S25)

| Student's name | SCIPER |
| -------------- | ------ |
| Cao Nguyen Pham | 354716 |
| Yaoyu Zhao | 319801 |
| Yingtian Tang | 368634 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (21st March, 5pm)

**10% of the final grade**

<!-- This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)* -->

This project aims to visualize the development progress, maintenance status, and adoption of new language features 
within the Dotty (Scala 3) compiler. By analyzing historical data, we will provide insights for both 
core developers and the broader Scala community.

### Dataset

<!-- > Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)), you could use also the DataSets proposed by the ENAC (see the Announcements section on Zulip). -->
Data will be sourced from the public Scala 3 GitHub repository ([scala/scala3](https://github.com/scala/scala3)), 
focusing on three key areas:

1. **Git Commits**: Analysis will include commit history data such as author details, commit messages, timestamps, and code changes to track the development process.
2. **Issues and Pull Requests**: We will extract issues and pull requests via GitHub API (JSON format) to analyze issue lifecycle, contributor engagement, and maintenance workflows.
3. **Codebase**: We will compute file-level metrics (e.g., modification frequency, feature adoption) to identify hotspots and stability trends.

Data extraction will be accomplished using Git for commit histories and GitHub’s API for issues and pull requests. 
Subsequent scripts will be used to clean and preprocess the data before visualization. 

Note that the Dotty compiler is open-source under the Apache License Version 2.0, and all other data is publicly available.

### Problematic

<!-- > Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience. -->

This project targets the Scala 3 maintainers, open-source contributors, and developers interested 
in compiler internals and new features.

- **For the core developers and organization**: Highlight areas needing improvement (e.g., frequently modified modules) and track feature adoption and stability trends.
- **For the community**: Present internal compiler development and showcase practical use cases of Scala 3’s new features.

### Exploratory Data Analysis

<!-- > Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data -->

The Scala 3 repository was created in December 2012 by Professor Martin Odersky and has since grown to over 40,000 commits from approximately 500 contributors.

A quick view of the commit history is available on the repository’s [graph page](https://github.com/scala/scala3/graphs/contributors), although it does not provide granular information due to the sheer volume of commits.

We first used the `git` command with custom formatting to extract sample commit data:
- Commits in the last year: `./some-sample-data/commits-last-year.csv`. 
- Commits for each source file: `./some-sample-data/commits-by-file.csv`.

Next, we developed custom Python scripts to generate statistics from the collected data.

#### File changes in the last year

The Python script `git-scripts/git_file_changes.py` collects the number of commits for each file in the last year.

```
compiler/src/dotty/tools/dotc/typer/Typer.scala                                                    : 139
compiler/src/dotty/tools/dotc/cc/CheckCaptures.scala                                               : 135
project/Build.scala                                                                                : 131
compiler/src/dotty/tools/dotc/cc/CaptureOps.scala                                                  : 128
compiler/src/dotty/tools/dotc/core/Types.scala                                                     : 98
compiler/src/dotty/tools/dotc/cc/Setup.scala                                                       : 97
compiler/src/dotty/tools/dotc/cc/CaptureSet.scala                                                  : 79
compiler/src/dotty/tools/dotc/parsing/Parsers.scala                                                : 73
compiler/src/dotty/tools/dotc/core/TypeComparer.scala                                              : 70
compiler/src/dotty/tools/dotc/core/Definitions.scala                                               : 69
compiler/src/dotty/tools/dotc/cc/SepCheck.scala                                                    : 62
compiler/src/dotty/tools/dotc/ast/Desugar.scala                                                    : 61
compiler/src/dotty/tools/dotc/typer/Applications.scala                                             : 58
compiler/src/dotty/tools/dotc/cc/CaptureRef.scala                                                  : 57
compiler/src/dotty/tools/dotc/reporting/messages.scala                                             : 46
compiler/src/dotty/tools/dotc/typer/Implicits.scala                                                : 42
compiler/src/dotty/tools/dotc/printing/RefinedPrinter.scala                                        : 40
compiler/src/dotty/tools/dotc/transform/init/Objects.scala                                         : 40
compiler/src/dotty/tools/dotc/typer/Namer.scala                                                    : 40
library/src/scala/caps.scala                                                                       : 39
...
```

It shows that the type checking (typer) and capture checking (cc) modules have seen the most modifications over the past year.

#### Author Statistics

The script `git-scripts/git_author_stats.py` collects the number of commits for each author.

```
Martin Odersky        : 631
Hamza Remmal          : 269
Dale Wijnand          : 133
noti0na1              : 129
Eugene Flesselle      : 110
Wojciech Mazur        : 110
Sébastien Doeraene    : 93
Matt Bovel            : 73
Guillaume Martres     : 68
Jan Chyb              : 65
Som Snytt             : 65
Jamie Thompson        : 61
Kacper Korban         : 61
Hamza REMMAL          : 58
Nicolas Stucki        : 51
Tomasz Godzik         : 47
Adrien Piquerez       : 44
Yichen Xu             : 31
kasiaMarek            : 27
aherlihy              : 26
...
```

Professor Martin Odersky leads significantly in commit contributions, way ahead of the other contributors.

### Related work

<!-- > - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class. -->

While there are several reports on the Scala ecosystem and community, there is no dedicated public report on the internal development of the Dotty compiler. Notable related reports include:
- Scala Survey 2023: https://scalasurvey2023.virtuslab.com
- JetBrains Developer Ecosystem 2024: https://www.jetbrains.com/lp/devecosystem-2024/
- SoftwareMill Scala 3 Tech Report: https://softwaremill.com/scala-3-tech-report/

<!-- https://blog.rust-lang.org/2025/02/13/2024-State-Of-Rust-Survey-results.html -->
Additionally, insights from monthly reports on the Rust compiler development ([Rust GCC Monthly Report](https://rust-gcc.github.io/2025/01/07/2024-12-monthly-report.html) have inspired our approach by providing detailed overviews of feature integrations, bug fixes, and development milestones.


## Milestone 2 (18th April, 5pm)

**10% of the final grade**


## Milestone 3 (30th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

