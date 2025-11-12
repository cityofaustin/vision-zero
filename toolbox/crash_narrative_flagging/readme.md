# Crash Narrative PII Flagging

This script runs a Large Language Model (LLM) locally to flag input text as potentially containing personally identifiable information (PII).


## Prompt

```
Question: Which of the following are present in this text?
OPTIONS:
(A) person names
(B) phone numbers 
(C) badge numbers
(D) healthcare facility
(E) none of the above
```


## Examples
**Input**:
> John Doe arrived early, carrying a briefcase and a quiet sense of purpose.

**Output**:
> (A)

***

**Input**:
> the old bridge creaked softly under the weight of the morning mist

**Output**:
> (E)

***

**Input**:
> Call us anytime at (512) 555-5555 for more information and assistance.

**Output**:
> (B)

***

## How to run this script

Supply your data through a CSV file. Check out `example_input.csv`. Edit the script directly to point to the correct file. (`SOURCE_FILE`, `DEST_FILE`)

By default, this script will run on NVIDIA GPUs on CUDA. If you have one, install CUDA:
- [Windows](https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/)
- [Linux](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/)

Next, [install pytorch](https://pytorch.org/) and make sure you select the correct version for your version of CUDA.

Lastly, install Pandas:

```commandline
pip install pandas
```

***

# Limitations

- This LLM is not perfect and all outputs require care before sharing PII data.
- The outputs are highly biased towards false positives especially dealing with proper nouns such as street names.
