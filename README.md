# Dotty (Scala 3) Compiler Visualization Report

Project of Data Visualization (COM-480 S25)

| Student's name | SCIPER |
| -------------- | ------ |
| Cao Nguyen Pham | 354716 |
| Yaoyu Zhao | 319801 |
| Yingtian Tang | ??? |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (21st March, 5pm)

**10% of the final grade**

<!-- This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)* -->

For this project, we will make a visualization report for the Dotty (Scala 3) compiler. 
The goal is to visualize the development of the compiler throughout the years,
the process and status of the maintaining, and distribution of new features used by the compiler itself.

### Dataset

<!-- > Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)), you could use also the DataSets proposed by the ENAC (see the Announcements section on Zulip). -->

All of our data will be collected from the Scala 3 ([scala/scala3](https://github.com/scala/scala3)) repository on GitHub.

There are three main sources of data that we will use:
1. **Git Commits**: We will use the commit history of the repository to analyze the development process of the compiler. This includes information about the authors, number of commits, commit messages, date and time, and code changes.
2. **Issues and Pull Requests**: We will analyze the issues and pull requests in the repository to understand the status of the maintaining process. This includes the number of open and closed issues, the number of pull requests, and their status (category, open duration, etc.).
3. **Code**: We will analyze the code to understand the development trend and the distribution of new features used by the compiler itself. For example, which files are the most modified, which files are the most stable, and how many places use a specific feature.

The code and commit history can be collected using git directly from the repository.
This is a straightforward process using the git command, and we can customize the output to include only the information we need.

The issues and pull requests can be collected using the GitHub API. The API will often provide the data in JSON format, which is easy to parse and analyze.

Later, we will write a script to further clean and process the data for our visualization.

The compiler is open-source and licensed under the Apache License Version 2.0. The other data is publicly available on GitHub.

### Problematic

<!-- > Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience. -->

The goal of this project is to provide a comprehensive overview of the development process of the Dotty compiler
and interesting insights about compiler internals.

- **For the core developers and organization**: This will help them understand the current state of the compiler and identify areas for improvement.
- **For the community**: This will help them understand the development process and real usages of new fearures in the compiler.

### Exploratory Data Analysis

<!-- > Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data -->

https://github.com/scala/scala3/graphs/contributors

This is a basic overview of the contributors to the repository. Not showing much information due to the number of commits.

### Related work

<!-- > - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class. -->

TODO: add more; delete if not needed

There is no public report on the Dotty compiler available as far as we know.

https://scalasurvey2023.virtuslab.com is a survey for Scala community and ecosystem.
https://www.jetbrains.com/lp/devecosystem-2024/
https://softwaremill.com/scala-3-tech-report/

https://blog.rust-lang.org/2025/02/13/2024-State-Of-Rust-Survey-results.html
https://rust-gcc.github.io/2025/01/07/2024-12-monthly-report.html monthly dveelopment report for rust


## Milestone 2 (18th April, 5pm)

**10% of the final grade**


## Milestone 3 (30th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

