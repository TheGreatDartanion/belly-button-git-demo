import json
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():

    return render_template('index.html')

@app.route("/test")
def test():

    return render_template('index-test.html')

@app.route("/samples")
def samples():

    with open('static/data/samples.json') as samples_file:
        samples_json = json.load(samples_file)
    
    return samples_json

if __name__ == "__main__":
    app.run(debug=True)