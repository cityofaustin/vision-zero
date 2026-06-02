from transformers import T5Tokenizer, T5ForConditionalGeneration
import pandas as pd

SOURCE_FILE = "example_input.csv"
DEST_FILE = "example_output.csv"

prompt = "Question: Which of the following are present in this text?\n"

options = ("OPTIONS:\n(A) person names\n(B) phone numbers \n(C) badge numbers\n(D) healthcare facility\n(E) none of "
           "the above")


def load_data():
    df = pd.read_csv(SOURCE_FILE)
    return df.to_dict("records")


def write_data(df):
    df.to_csv(DEST_FILE)


def load_model():
    tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-xl")
    model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-xl", device_map="auto")
    return model, tokenizer


def annotate_text(model, tokenizer, context):
    input_tokens = tokenizer(f"{context}{prompt}{options}", return_tensors="pt").input_ids.to(
        "cuda")
    outputs = model.generate(input_tokens, max_new_tokens=50)
    outputs = tokenizer.decode(outputs[0])
    print(context)
    print(outputs)
    return outputs


def main():
    model, tokenizer = load_model()

    count = 0
    data = load_data()
    for row in data:
        if isinstance(row["narrative"], str):
            row["output"] = annotate_text(model, tokenizer, row["narrative"])
        else:
            row["output"] = None
        count += 1
        if count % 100 == 0:
            write_data(pd.DataFrame(data))
    write_data(pd.DataFrame(data))


main()
