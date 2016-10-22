# Supermind Load Job Generator

Supermind uses an extract-transform-load (ETL) process to ingest data into the Supermind Graph.

The final stage of this process (the "load" stage) involves importing pre-prepared CSV files into the Supermind Graph.
These CSV files are referred to as "load jobs".

In production, these "load jobs" will be generated as a result of the previous "extract" and "transform" stages.

This tool allows us to bypass these two stages ("extract" and "transform") by generating mock "load jobs" that can be
fed straight into the final "load" stage.

*NOTE: a load job actually contains two files... a CSV file for the data, and a JSON file for the metadata.*

**WARNING #1:** Requires 25GB of storage space to run.

**WARNING #2:** Output folder will contain ~100,000 files. This may crash some IDEs, hence why the output folder isn't a
child of this project.

## How to run

To generate the mock "load jobs":

    yarn
    yarn start

The results will be stored to:

    ../supermind-load-job-mocks

## How the ETL process works

### Extract

The process of transforming a document (e.g. webpage, PDF, etc.) into a single standardised format (CSV in our case).

### Transform

The process of standardising and making sense of data within the extracted table. For example, normalising dates,
identifying links between cell values and external tables, etc.

### Load

The process of loading a clean, normalised table into Supermind.

A "Supermind Load Job" simply represents data that requires no further processing, but requires inserting into the
Supermind Graph.

Superming Load Jobs consist of two files:

-   `load-job.json`: the metadata file.

-   `load-job.csv`: the data file.

Both files must share the same name (before the extension).
