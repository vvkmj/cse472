export const bundledApiData = {
  "models": [
    {
      "id": "logistic_regression",
      "name": "Logistic Regression (TF-IDF Baseline)",
      "type": "Traditional"
    },
    {
      "id": "linear_svm",
      "name": "Linear SVM (TF-IDF Baseline)",
      "type": "Traditional"
    },
    {
      "id": "word2vec_cbow",
      "name": "Word2Vec CBOW + Classifier",
      "type": "Word Embeddings"
    },
    {
      "id": "word2vec_skipgram",
      "name": "Word2Vec Skip-Gram + Classifier",
      "type": "Word Embeddings"
    },
    {
      "id": "lstm",
      "name": "LSTM (Unidirectional)",
      "type": "Deep Learning RNN"
    },
    {
      "id": "bilstm",
      "name": "Bidirectional LSTM (BiLSTM)",
      "type": "Deep Learning RNN"
    },
    {
      "id": "attention_bilstm",
      "name": "Attention-Based BiLSTM",
      "type": "Attention Architecture"
    },
    {
      "id": "bert_finetuned",
      "name": "Fine-Tuned BERT / DistilBERT",
      "type": "Transformer"
    }
  ],
  "metrics": {
    "logistic_regression": {
      "model_name": "Logistic Regression (TF-IDF)",
      "accuracy": 0.84,
      "precision_macro": 0.833,
      "recall_macro": 0.8297,
      "f1_macro": 0.831,
      "precision_weighted": 0.8437,
      "recall_weighted": 0.84,
      "f1_weighted": 0.8414,
      "confusion_matrix": [
        [
          1162,
          1,
          1,
          21,
          13,
          1
        ],
        [
          1,
          1172,
          2,
          7,
          10,
          1
        ],
        [
          4,
          7,
          996,
          108,
          64,
          3
        ],
        [
          41,
          8,
          43,
          758,
          287,
          38
        ],
        [
          15,
          6,
          35,
          308,
          542,
          9
        ],
        [
          1,
          3,
          6,
          44,
          10,
          1135
        ]
      ],
      "class_report": {
        "age": {
          "precision": 0.9493464052287581,
          "recall": 0.969140950792327,
          "f1-score": 0.9591415600495253,
          "support": 1199.0
        },
        "ethnicity": {
          "precision": 0.9791144527986633,
          "recall": 0.9823973176865046,
          "f1-score": 0.9807531380753138,
          "support": 1193.0
        },
        "gender": {
          "precision": 0.9196675900277008,
          "recall": 0.8426395939086294,
          "f1-score": 0.8794701986754967,
          "support": 1182.0
        },
        "not_cyberbullying": {
          "precision": 0.608346709470305,
          "recall": 0.6451063829787234,
          "f1-score": 0.6261875258157786,
          "support": 1175.0
        },
        "other_cyberbullying": {
          "precision": 0.5853131749460043,
          "recall": 0.5923497267759563,
          "f1-score": 0.5888104291146117,
          "support": 915.0
        },
        "religion": {
          "precision": 0.9561920808761584,
          "recall": 0.9466221851542952,
          "f1-score": 0.9513830678960603,
          "support": 1199.0
        },
        "accuracy": 0.8400116567098936,
        "macro avg": {
          "precision": 0.8329967355579319,
          "recall": 0.829709359549406,
          "f1-score": 0.830957653271131,
          "support": 6863.0
        },
        "weighted avg": {
          "precision": 0.8436893803212218,
          "recall": 0.8400116567098936,
          "f1-score": 0.8414429816317139,
          "support": 6863.0
        }
      },
      "class_names": [
        "age",
        "ethnicity",
        "gender",
        "not_cyberbullying",
        "other_cyberbullying",
        "religion"
      ]
    },
    "linear_svm": {
      "model_name": "Linear SVM (TF-IDF)",
      "accuracy": 0.8346,
      "precision_macro": 0.8251,
      "recall_macro": 0.8238,
      "f1_macro": 0.8242,
      "precision_weighted": 0.8363,
      "recall_weighted": 0.8346,
      "f1_weighted": 0.8352,
      "confusion_matrix": [
        [
          1166,
          0,
          2,
          17,
          12,
          2
        ],
        [
          1,
          1170,
          3,
          7,
          10,
          2
        ],
        [
          5,
          7,
          994,
          104,
          66,
          6
        ],
        [
          35,
          10,
          57,
          726,
          303,
          44
        ],
        [
          11,
          8,
          38,
          324,
          526,
          8
        ],
        [
          2,
          4,
          9,
          28,
          10,
          1146
        ]
      ],
      "class_report": {
        "age": {
          "precision": 0.9557377049180328,
          "recall": 0.9724770642201835,
          "f1-score": 0.9640347250930137,
          "support": 1199.0
        },
        "ethnicity": {
          "precision": 0.97581317764804,
          "recall": 0.980720871751886,
          "f1-score": 0.9782608695652174,
          "support": 1193.0
        },
        "gender": {
          "precision": 0.9011786038077969,
          "recall": 0.8409475465313029,
          "f1-score": 0.8700218818380744,
          "support": 1182.0
        },
        "not_cyberbullying": {
          "precision": 0.6019900497512438,
          "recall": 0.617872340425532,
          "f1-score": 0.6098278034439312,
          "support": 1175.0
        },
        "other_cyberbullying": {
          "precision": 0.5674217907227616,
          "recall": 0.5748633879781421,
          "f1-score": 0.5711183496199783,
          "support": 915.0
        },
        "religion": {
          "precision": 0.9486754966887417,
          "recall": 0.9557964970809008,
          "f1-score": 0.9522226838388035,
          "support": 1199.0
        },
        "accuracy": 0.8346204283840886,
        "macro avg": {
          "precision": 0.8251361372561027,
          "recall": 0.8237796179979912,
          "f1-score": 0.8242477188998364,
          "support": 6863.0
        },
        "weighted avg": {
          "precision": 0.8362609509442647,
          "recall": 0.8346204283840886,
          "f1-score": 0.8352243441617451,
          "support": 6863.0
        }
      },
      "class_names": [
        "age",
        "ethnicity",
        "gender",
        "not_cyberbullying",
        "other_cyberbullying",
        "religion"
      ]
    },
    "word2vec_cbow": {
      "model_name": "Word2Vec CBOW + Logistic Regression",
      "accuracy": 0.7849,
      "precision_macro": 0.7723,
      "recall_macro": 0.7724,
      "f1_macro": 0.7717,
      "precision_weighted": 0.7831,
      "recall_weighted": 0.7849,
      "f1_weighted": 0.7834,
      "confusion_matrix": [
        [
          1113,
          2,
          3,
          67,
          11,
          3
        ],
        [
          4,
          1150,
          5,
          14,
          16,
          4
        ],
        [
          7,
          12,
          918,
          155,
          74,
          16
        ],
        [
          67,
          30,
          73,
          648,
          283,
          74
        ],
        [
          34,
          33,
          66,
          304,
          443,
          35
        ],
        [
          5,
          11,
          9,
          38,
          21,
          1115
        ]
      ],
      "class_report": {
        "age": {
          "precision": 0.9048780487804878,
          "recall": 0.9282735613010842,
          "f1-score": 0.9164265129682997,
          "support": 1199.0
        },
        "ethnicity": {
          "precision": 0.9289176090468497,
          "recall": 0.9639564124057,
          "f1-score": 0.9461127108185932,
          "support": 1193.0
        },
        "gender": {
          "precision": 0.8547486033519553,
          "recall": 0.7766497461928934,
          "f1-score": 0.8138297872340425,
          "support": 1182.0
        },
        "not_cyberbullying": {
          "precision": 0.5285481239804242,
          "recall": 0.5514893617021277,
          "f1-score": 0.5397750937109538,
          "support": 1175.0
        },
        "other_cyberbullying": {
          "precision": 0.5224056603773585,
          "recall": 0.48415300546448087,
          "f1-score": 0.5025524673851389,
          "support": 915.0
        },
        "religion": {
          "precision": 0.8941459502806736,
          "recall": 0.9299416180150125,
          "f1-score": 0.9116925592804579,
          "support": 1199.0
        },
        "accuracy": 0.78493370246248,
        "macro avg": {
          "precision": 0.772273999302958,
          "recall": 0.7724106175135498,
          "f1-score": 0.7717315218995809,
          "support": 6863.0
        },
        "weighted avg": {
          "precision": 0.7831249535992302,
          "recall": 0.78493370246248,
          "f1-score": 0.7834249282983029,
          "support": 6863.0
        }
      },
      "class_names": [
        "age",
        "ethnicity",
        "gender",
        "not_cyberbullying",
        "other_cyberbullying",
        "religion"
      ]
    },
    "word2vec_skipgram": {
      "model_name": "Word2Vec Skip-Gram + Logistic Regression",
      "accuracy": 0.7854,
      "precision_macro": 0.7676,
      "recall_macro": 0.7727,
      "f1_macro": 0.7697,
      "precision_weighted": 0.7784,
      "recall_weighted": 0.7854,
      "f1_weighted": 0.7814,
      "confusion_matrix": [
        [
          1124,
          5,
          1,
          48,
          19,
          2
        ],
        [
          6,
          1132,
          7,
          19,
          17,
          12
        ],
        [
          7,
          13,
          939,
          126,
          81,
          16
        ],
        [
          65,
          34,
          89,
          625,
          280,
          82
        ],
        [
          50,
          37,
          94,
          259,
          441,
          34
        ],
        [
          3,
          8,
          9,
          35,
          15,
          1129
        ]
      ],
      "class_report": {
        "age": {
          "precision": 0.895617529880478,
          "recall": 0.9374478732276897,
          "f1-score": 0.9160554197229014,
          "support": 1199.0
        },
        "ethnicity": {
          "precision": 0.9210740439381611,
          "recall": 0.9488683989941324,
          "f1-score": 0.93476465730801,
          "support": 1193.0
        },
        "gender": {
          "precision": 0.8244073748902546,
          "recall": 0.7944162436548223,
          "f1-score": 0.8091339939681171,
          "support": 1182.0
        },
        "not_cyberbullying": {
          "precision": 0.5620503597122302,
          "recall": 0.5319148936170213,
          "f1-score": 0.5465675557498907,
          "support": 1175.0
        },
        "other_cyberbullying": {
          "precision": 0.5169988276670574,
          "recall": 0.4819672131147541,
          "f1-score": 0.498868778280543,
          "support": 915.0
        },
        "religion": {
          "precision": 0.8854901960784314,
          "recall": 0.9416180150125104,
          "f1-score": 0.9126919967663703,
          "support": 1199.0
        },
        "accuracy": 0.7853708290834912,
        "macro avg": {
          "precision": 0.7676063886944355,
          "recall": 0.7727054396034884,
          "f1-score": 0.7696804002993054,
          "support": 6863.0
        },
        "weighted avg": {
          "precision": 0.7784208239750062,
          "recall": 0.7853708290834912,
          "f1-score": 0.7814251172289416,
          "support": 6863.0
        }
      },
      "class_names": [
        "age",
        "ethnicity",
        "gender",
        "not_cyberbullying",
        "other_cyberbullying",
        "religion"
      ]
    },
    "lstm": {
      "model_name": "LSTM (Unidirectional)",
      "accuracy": 0.8453,
      "precision_macro": 0.8364,
      "recall_macro": 0.8339,
      "f1_macro": 0.8349,
      "precision_weighted": 0.8464,
      "recall_weighted": 0.8453,
      "f1_weighted": 0.8456,
      "confusion_matrix": [
        [
          1168,
          2,
          2,
          21,
          4,
          2
        ],
        [
          1,
          1168,
          7,
          4,
          12,
          1
        ],
        [
          0,
          5,
          1033,
          104,
          35,
          5
        ],
        [
          17,
          5,
          64,
          773,
          278,
          38
        ],
        [
          11,
          5,
          61,
          312,
          521,
          5
        ],
        [
          3,
          2,
          4,
          45,
          7,
          1138
        ]
      ],
      "class_report": {
        "age": {
          "precision": 0.9733333333333334,
          "recall": 0.9741451209341118,
          "f1-score": 0.9737390579408086,
          "support": 1199.0
        },
        "ethnicity": {
          "precision": 0.9839932603201348,
          "recall": 0.9790444258172674,
          "f1-score": 0.9815126050420168,
          "support": 1193.0
        },
        "gender": {
          "precision": 0.8821520068317678,
          "recall": 0.873942470389171,
          "f1-score": 0.8780280492987675,
          "support": 1182.0
        },
        "not_cyberbullying": {
          "precision": 0.613979348689436,
          "recall": 0.6578723404255319,
          "f1-score": 0.6351684470008216,
          "support": 1175.0
        },
        "other_cyberbullying": {
          "precision": 0.6079346557759626,
          "recall": 0.5693989071038251,
          "f1-score": 0.5880361173814899,
          "support": 915.0
        },
        "religion": {
          "precision": 0.9571068124474348,
          "recall": 0.9491242702251876,
          "f1-score": 0.9530988274706867,
          "support": 1199.0
        },
        "accuracy": 0.8452571761620282,
        "macro avg": {
          "precision": 0.836416569566345,
          "recall": 0.8339212558158491,
          "f1-score": 0.8349305173557652,
          "support": 6863.0
        },
        "weighted avg": {
          "precision": 0.8464070102248732,
          "recall": 0.8452571761620282,
          "f1-score": 0.8456109994644735,
          "support": 6863.0
        }
      },
      "class_names": [
        "age",
        "ethnicity",
        "gender",
        "not_cyberbullying",
        "other_cyberbullying",
        "religion"
      ]
    },
    "bilstm": {
      "model_name": "Bidirectional LSTM",
      "accuracy": 0.8496,
      "precision_macro": 0.8405,
      "recall_macro": 0.8423,
      "f1_macro": 0.8404,
      "precision_weighted": 0.8511,
      "recall_weighted": 0.8496,
      "f1_weighted": 0.8495,
      "confusion_matrix": [
        [
          1164,
          1,
          1,
          25,
          3,
          5
        ],
        [
          0,
          1169,
          7,
          5,
          12,
          0
        ],
        [
          0,
          6,
          1031,
          81,
          59,
          5
        ],
        [
          13,
          4,
          70,
          689,
          345,
          54
        ],
        [
          9,
          8,
          64,
          204,
          625,
          5
        ],
        [
          1,
          2,
          2,
          30,
          11,
          1153
        ]
      ],
      "class_report": {
        "age": {
          "precision": 0.9806234203875316,
          "recall": 0.9708090075062552,
          "f1-score": 0.9756915339480302,
          "support": 1199.0
        },
        "ethnicity": {
          "precision": 0.9823529411764705,
          "recall": 0.9798826487845766,
          "f1-score": 0.9811162400335711,
          "support": 1193.0
        },
        "gender": {
          "precision": 0.8774468085106383,
          "recall": 0.8722504230118443,
          "f1-score": 0.8748408994484514,
          "support": 1182.0
        },
        "not_cyberbullying": {
          "precision": 0.6663442940038685,
          "recall": 0.5863829787234043,
          "f1-score": 0.6238116794929832,
          "support": 1175.0
        },
        "other_cyberbullying": {
          "precision": 0.5924170616113744,
          "recall": 0.6830601092896175,
          "f1-score": 0.6345177664974619,
          "support": 915.0
        },
        "religion": {
          "precision": 0.9435351882160393,
          "recall": 0.9616346955796498,
          "f1-score": 0.9524989673688559,
          "support": 1199.0
        },
        "accuracy": 0.8496284423721404,
        "macro avg": {
          "precision": 0.8404532856509871,
          "recall": 0.8423366438158914,
          "f1-score": 0.8404128477982256,
          "support": 6863.0
        },
        "weighted avg": {
          "precision": 0.8511105223703539,
          "recall": 0.8496284423721404,
          "f1-score": 0.8494822247321142,
          "support": 6863.0
        }
      },
      "class_names": [
        "age",
        "ethnicity",
        "gender",
        "not_cyberbullying",
        "other_cyberbullying",
        "religion"
      ]
    },
    "attention_bilstm": {
      "model_name": "Attention-BiLSTM",
      "accuracy": 0.841,
      "precision_macro": 0.8383,
      "recall_macro": 0.8361,
      "f1_macro": 0.833,
      "precision_weighted": 0.8506,
      "recall_weighted": 0.841,
      "f1_weighted": 0.842,
      "confusion_matrix": [
        [
          1171,
          1,
          1,
          19,
          6,
          1
        ],
        [
          2,
          1163,
          5,
          7,
          13,
          3
        ],
        [
          3,
          6,
          963,
          105,
          99,
          6
        ],
        [
          26,
          4,
          18,
          643,
          422,
          62
        ],
        [
          14,
          6,
          42,
          163,
          676,
          14
        ],
        [
          3,
          2,
          3,
          18,
          17,
          1156
        ]
      ],
      "class_report": {
        "age": {
          "precision": 0.9606234618539786,
          "recall": 0.9766472060050042,
          "f1-score": 0.9685690653432589,
          "support": 1199.0
        },
        "ethnicity": {
          "precision": 0.9839255499153976,
          "recall": 0.9748533109807209,
          "f1-score": 0.9793684210526316,
          "support": 1193.0
        },
        "gender": {
          "precision": 0.9331395348837209,
          "recall": 0.8147208121827412,
          "f1-score": 0.8699186991869918,
          "support": 1182.0
        },
        "not_cyberbullying": {
          "precision": 0.6732984293193718,
          "recall": 0.5472340425531915,
          "f1-score": 0.603755868544601,
          "support": 1175.0
        },
        "other_cyberbullying": {
          "precision": 0.5482562854825629,
          "recall": 0.7387978142076502,
          "f1-score": 0.6294227188081937,
          "support": 915.0
        },
        "religion": {
          "precision": 0.9307568438003221,
          "recall": 0.9641367806505421,
          "f1-score": 0.9471528062269562,
          "support": 1199.0
        },
        "accuracy": 0.8410316188255865,
        "macro avg": {
          "precision": 0.8383333508758923,
          "recall": 0.8360649944299752,
          "f1-score": 0.8330312631937722,
          "support": 6863.0
        },
        "weighted avg": {
          "precision": 0.8505521278490371,
          "recall": 0.8410316188255865,
          "f1-score": 0.8420393247875427,
          "support": 6863.0
        }
      },
      "class_names": [
        "age",
        "ethnicity",
        "gender",
        "not_cyberbullying",
        "other_cyberbullying",
        "religion"
      ]
    },
    "bert_finetuned": {
      "model_name": "Fine-Tuned BERT (distilbert-base-uncased)",
      "accuracy": 0.782,
      "precision_macro": 0.8595,
      "recall_macro": 0.7528,
      "f1_macro": 0.7218,
      "precision_weighted": 0.8458,
      "recall_weighted": 0.782,
      "f1_weighted": 0.7455,
      "confusion_matrix": [
        [
          172,
          1,
          0,
          1,
          0,
          0
        ],
        [
          0,
          131,
          2,
          11,
          0,
          0
        ],
        [
          0,
          0,
          160,
          26,
          0,
          2
        ],
        [
          9,
          1,
          18,
          144,
          0,
          13
        ],
        [
          2,
          1,
          6,
          118,
          3,
          1
        ],
        [
          0,
          0,
          2,
          4,
          0,
          172
        ]
      ],
      "class_report": {
        "age": {
          "precision": 0.9398907103825137,
          "recall": 0.9885057471264368,
          "f1-score": 0.9635854341736695,
          "support": 174.0
        },
        "ethnicity": {
          "precision": 0.9776119402985075,
          "recall": 0.9097222222222222,
          "f1-score": 0.9424460431654677,
          "support": 144.0
        },
        "gender": {
          "precision": 0.851063829787234,
          "recall": 0.851063829787234,
          "f1-score": 0.851063829787234,
          "support": 188.0
        },
        "not_cyberbullying": {
          "precision": 0.47368421052631576,
          "recall": 0.7783783783783784,
          "f1-score": 0.588957055214724,
          "support": 185.0
        },
        "other_cyberbullying": {
          "precision": 1.0,
          "recall": 0.022900763358778626,
          "f1-score": 0.04477611940298507,
          "support": 131.0
        },
        "religion": {
          "precision": 0.9148936170212766,
          "recall": 0.9662921348314607,
          "f1-score": 0.9398907103825137,
          "support": 178.0
        },
        "accuracy": 0.782,
        "macro avg": {
          "precision": 0.8595240513359746,
          "recall": 0.7528105126174185,
          "f1-score": 0.721786532021099,
          "support": 1000.0
        },
        "weighted avg": {
          "precision": 0.845799745786698,
          "recall": 0.782,
          "f1-score": 0.7454993690666483,
          "support": 1000.0
        }
      },
      "class_names": [
        "age",
        "ethnicity",
        "gender",
        "not_cyberbullying",
        "other_cyberbullying",
        "religion"
      ],
      "training_time_seconds": 12700.16,
      "base_model": "distilbert-base-uncased"
    }
  },
  "summary_table": [
    {
      "model_id": "logistic_regression",
      "model_name": "Logistic Regression (TF-IDF)",
      "accuracy": 0.84,
      "precision_macro": 0.833,
      "recall_macro": 0.8297,
      "f1_macro": 0.831,
      "f1_weighted": 0.8414
    },
    {
      "model_id": "linear_svm",
      "model_name": "Linear SVM (TF-IDF)",
      "accuracy": 0.8346,
      "precision_macro": 0.8251,
      "recall_macro": 0.8238,
      "f1_macro": 0.8242,
      "f1_weighted": 0.8352
    },
    {
      "model_id": "word2vec_cbow",
      "model_name": "Word2Vec CBOW + Logistic Regression",
      "accuracy": 0.7849,
      "precision_macro": 0.7723,
      "recall_macro": 0.7724,
      "f1_macro": 0.7717,
      "f1_weighted": 0.7834
    },
    {
      "model_id": "word2vec_skipgram",
      "model_name": "Word2Vec Skip-Gram + Logistic Regression",
      "accuracy": 0.7854,
      "precision_macro": 0.7676,
      "recall_macro": 0.7727,
      "f1_macro": 0.7697,
      "f1_weighted": 0.7814
    },
    {
      "model_id": "lstm",
      "model_name": "LSTM (Unidirectional)",
      "accuracy": 0.8453,
      "precision_macro": 0.8364,
      "recall_macro": 0.8339,
      "f1_macro": 0.8349,
      "f1_weighted": 0.8456
    },
    {
      "model_id": "bilstm",
      "model_name": "Bidirectional LSTM",
      "accuracy": 0.8496,
      "precision_macro": 0.8405,
      "recall_macro": 0.8423,
      "f1_macro": 0.8404,
      "f1_weighted": 0.8495
    },
    {
      "model_id": "attention_bilstm",
      "model_name": "Attention-BiLSTM",
      "accuracy": 0.841,
      "precision_macro": 0.8383,
      "recall_macro": 0.8361,
      "f1_macro": 0.833,
      "f1_weighted": 0.842
    },
    {
      "model_id": "bert_finetuned",
      "model_name": "Fine-Tuned BERT (distilbert-base-uncased)",
      "accuracy": 0.782,
      "precision_macro": 0.8595,
      "recall_macro": 0.7528,
      "f1_macro": 0.7218,
      "f1_weighted": 0.7455
    }
  ],
  "dataset_summary": {
    "initial_raw_records": 47692,
    "duplicate_records_removed": 1675,
    "valid_processed_records": 45749,
    "train_records": 32024,
    "val_records": 6862,
    "test_records": 6863,
    "label2id": {
      "age": 0,
      "ethnicity": 1,
      "gender": 2,
      "not_cyberbullying": 3,
      "other_cyberbullying": 4,
      "religion": 5
    },
    "id2label": {
      "0": "age",
      "1": "ethnicity",
      "2": "gender",
      "3": "not_cyberbullying",
      "4": "other_cyberbullying",
      "5": "religion"
    },
    "train_class_distribution": {
      "religion": 5597,
      "age": 5594,
      "ethnicity": 5565,
      "gender": 5513,
      "not_cyberbullying": 5483,
      "other_cyberbullying": 4272
    },
    "test_class_distribution": {
      "age": 1199,
      "religion": 1199,
      "ethnicity": 1193,
      "gender": 1182,
      "not_cyberbullying": 1175,
      "other_cyberbullying": 915
    }
  },
  "word2vec": {
    "visualizations": {
      "cbow_coords": [
        {
          "word": "school",
          "pca_x": 6.3415,
          "pca_y": -6.2015,
          "tsne_x": 0.8717,
          "tsne_y": 5.9723
        },
        {
          "word": "\u2019",
          "pca_x": 2.5195,
          "pca_y": -1.197,
          "tsne_x": 2.5231,
          "tsne_y": 1.8113
        },
        {
          "word": "not",
          "pca_x": -1.4516,
          "pca_y": 0.4117,
          "tsne_x": -1.1077,
          "tsne_y": -1.0688
        },
        {
          "word": "fuck",
          "pca_x": 1.2566,
          "pca_y": 5.9624,
          "tsne_x": -3.6802,
          "tsne_y": -4.9323
        },
        {
          "word": "like",
          "pca_x": 1.5226,
          "pca_y": -0.6386,
          "tsne_x": 1.6111,
          "tsne_y": -0.2785
        },
        {
          "word": "nigger",
          "pca_x": 0.3698,
          "pca_y": 6.8811,
          "tsne_x": -3.5586,
          "tsne_y": -5.2899
        },
        {
          "word": "joke",
          "pca_x": 2.0161,
          "pca_y": 4.9821,
          "tsne_x": 5.0911,
          "tsne_y": 0.5021
        },
        {
          "word": "girl",
          "pca_x": 8.0785,
          "pca_y": -4.3674,
          "tsne_x": 2.2214,
          "tsne_y": 4.5807
        },
        {
          "word": "u",
          "pca_x": -3.1265,
          "pca_y": -0.1705,
          "tsne_x": -6.0097,
          "tsne_y": 0.3592
        },
        {
          "word": "dumb",
          "pca_x": 0.0408,
          "pca_y": 5.3435,
          "tsne_x": -4.1512,
          "tsne_y": -4.8754
        },
        {
          "word": "bully",
          "pca_x": 5.5088,
          "pca_y": -6.1468,
          "tsne_x": 0.58,
          "tsne_y": 5.2062
        },
        {
          "word": "high",
          "pca_x": 7.6844,
          "pca_y": -6.2474,
          "tsne_x": 1.9192,
          "tsne_y": 4.9212
        },
        {
          "word": "people",
          "pca_x": -0.4269,
          "pca_y": -0.2265,
          "tsne_x": 2.0086,
          "tsne_y": -1.4989
        },
        {
          "word": "muslim",
          "pca_x": -7.5974,
          "pca_y": -2.5154,
          "tsne_x": 5.6479,
          "tsne_y": -1.6266
        },
        {
          "word": "bullied",
          "pca_x": 8.845,
          "pca_y": -6.7505,
          "tsne_x": 2.0083,
          "tsne_y": 5.373
        },
        {
          "word": "gay",
          "pca_x": 2.1716,
          "pca_y": 4.499,
          "tsne_x": 5.1337,
          "tsne_y": 0.5145
        },
        {
          "word": "rape",
          "pca_x": 0.8945,
          "pca_y": 4.5637,
          "tsne_x": 5.2655,
          "tsne_y": 0.5352
        },
        {
          "word": "rt",
          "pca_x": -1.5173,
          "pca_y": 5.5004,
          "tsne_x": -2.2801,
          "tsne_y": -3.2046
        },
        {
          "word": "one",
          "pca_x": 0.7244,
          "pca_y": -2.5746,
          "tsne_x": 0.2527,
          "tsne_y": 2.6736
        },
        {
          "word": "idiot",
          "pca_x": -6.4807,
          "pca_y": -0.9305,
          "tsne_x": -4.9862,
          "tsne_y": 2.5373
        },
        {
          "word": "no",
          "pca_x": -1.6318,
          "pca_y": -0.5248,
          "tsne_x": -2.9595,
          "tsne_y": 2.1972
        },
        {
          "word": "im",
          "pca_x": 2.5783,
          "pca_y": 2.7546,
          "tsne_x": -1.3198,
          "tsne_y": -3.2134
        },
        {
          "word": "dont",
          "pca_x": -2.7534,
          "pca_y": 1.5774,
          "tsne_x": -4.2903,
          "tsne_y": -0.9007
        },
        {
          "word": "woman",
          "pca_x": -0.5267,
          "pca_y": 2.2869,
          "tsne_x": -2.3606,
          "tsne_y": 4.1352
        },
        {
          "word": "get",
          "pca_x": 2.3312,
          "pca_y": -0.044,
          "tsne_x": -1.757,
          "tsne_y": 1.4891
        },
        {
          "word": "\u201c",
          "pca_x": 3.2053,
          "pca_y": 2.0746,
          "tsne_x": 3.355,
          "tsne_y": 2.087
        },
        {
          "word": "black",
          "pca_x": -0.1458,
          "pca_y": 3.8574,
          "tsne_x": 3.1448,
          "tsne_y": -4.4426
        },
        {
          "word": "as",
          "pca_x": 2.4625,
          "pca_y": 5.6944,
          "tsne_x": -3.6617,
          "tsne_y": -4.9476
        },
        {
          "word": "\u201d",
          "pca_x": 2.4574,
          "pca_y": 1.9171,
          "tsne_x": 0.6378,
          "tsne_y": -3.2482
        },
        {
          "word": "bitch",
          "pca_x": 2.7838,
          "pca_y": 4.7142,
          "tsne_x": -2.0443,
          "tsne_y": -5.3199
        },
        {
          "word": "know",
          "pca_x": -1.0342,
          "pca_y": -0.4919,
          "tsne_x": -1.2585,
          "tsne_y": -0.3982
        },
        {
          "word": "mkr",
          "pca_x": 0.565,
          "pca_y": 2.3454,
          "tsne_x": -3.3819,
          "tsne_y": -2.6054
        },
        {
          "word": "white",
          "pca_x": -0.1539,
          "pca_y": 3.4202,
          "tsne_x": 3.0943,
          "tsne_y": -4.4568
        },
        {
          "word": "think",
          "pca_x": 0.1856,
          "pca_y": 1.2717,
          "tsne_x": -0.5641,
          "tsne_y": -0.9997
        },
        {
          "word": "right",
          "pca_x": -3.2276,
          "pca_y": 0.6464,
          "tsne_x": -3.0949,
          "tsne_y": 3.9346
        },
        {
          "word": "say",
          "pca_x": -1.2451,
          "pca_y": 2.5981,
          "tsne_x": 0.3739,
          "tsne_y": -2.4154
        },
        {
          "word": "make",
          "pca_x": 1.5038,
          "pca_y": 1.4855,
          "tsne_x": 3.204,
          "tsne_y": 0.4003
        },
        {
          "word": "would",
          "pca_x": 1.2211,
          "pca_y": -1.9588,
          "tsne_x": 0.7637,
          "tsne_y": 1.6684
        },
        {
          "word": "christian",
          "pca_x": -6.1885,
          "pca_y": -1.7764,
          "tsne_x": -3.7122,
          "tsne_y": 4.6791
        },
        {
          "word": "call",
          "pca_x": 0.2171,
          "pca_y": 4.4016,
          "tsne_x": -0.8801,
          "tsne_y": -5.9202
        },
        {
          "word": "go",
          "pca_x": 0.3956,
          "pca_y": 0.0957,
          "tsne_x": -2.6174,
          "tsne_y": 1.3038
        },
        {
          "word": "time",
          "pca_x": 1.5298,
          "pca_y": -2.7186,
          "tsne_x": -0.4798,
          "tsne_y": 3.1998
        },
        {
          "word": "got",
          "pca_x": 5.1236,
          "pca_y": -1.3411,
          "tsne_x": 2.0104,
          "tsne_y": 3.3373
        },
        {
          "word": "fucking",
          "pca_x": 1.5823,
          "pca_y": 4.6866,
          "tsne_x": -2.2549,
          "tsne_y": -4.6357
        },
        {
          "word": "even",
          "pca_x": -0.0235,
          "pca_y": -0.5153,
          "tsne_x": -0.7316,
          "tsne_y": -0.0884
        },
        {
          "word": "want",
          "pca_x": -1.3094,
          "pca_y": -0.1539,
          "tsne_x": -2.6164,
          "tsne_y": 0.2047
        },
        {
          "word": "never",
          "pca_x": 1.0139,
          "pca_y": -2.2581,
          "tsne_x": 1.32,
          "tsne_y": 2.0703
        },
        {
          "word": "called",
          "pca_x": 0.9687,
          "pca_y": 2.6411,
          "tsne_x": 2.3779,
          "tsne_y": -4.431
        },
        {
          "word": "see",
          "pca_x": -0.0133,
          "pca_y": -0.1908,
          "tsne_x": -1.4934,
          "tsne_y": 0.1368
        },
        {
          "word": "shit",
          "pca_x": 2.4704,
          "pca_y": 2.8239,
          "tsne_x": -2.8213,
          "tsne_y": -4.1337
        },
        {
          "word": "ur",
          "pca_x": -1.6563,
          "pca_y": -1.4297,
          "tsne_x": -6.4136,
          "tsne_y": -0.1679
        },
        {
          "word": "terrorist",
          "pca_x": -8.6959,
          "pca_y": -5.06,
          "tsne_x": -6.6291,
          "tsne_y": 2.9164
        },
        {
          "word": "thing",
          "pca_x": 0.6147,
          "pca_y": -1.5078,
          "tsne_x": 1.1871,
          "tsne_y": 0.9412
        },
        {
          "word": "still",
          "pca_x": 0.8931,
          "pca_y": 0.1657,
          "tsne_x": -0.6243,
          "tsne_y": -0.6378
        },
        {
          "word": "hate",
          "pca_x": -1.2794,
          "pca_y": 1.821,
          "tsne_x": -0.4709,
          "tsne_y": -1.8564
        },
        {
          "word": "really",
          "pca_x": 2.3521,
          "pca_y": 0.5645,
          "tsne_x": 0.0988,
          "tsne_y": -0.347
        },
        {
          "word": "need",
          "pca_x": -1.1972,
          "pca_y": -0.7846,
          "tsne_x": -2.9404,
          "tsne_y": 0.1968
        },
        {
          "word": "year",
          "pca_x": 3.1815,
          "pca_y": -6.6885,
          "tsne_x": 1.8347,
          "tsne_y": -6.3251
        },
        {
          "word": "said",
          "pca_x": 1.2916,
          "pca_y": 1.5462,
          "tsne_x": 0.7109,
          "tsne_y": -2.5243
        },
        {
          "word": "support",
          "pca_x": -6.058,
          "pca_y": -2.1565,
          "tsne_x": -4.3836,
          "tsne_y": 4.5581
        },
        {
          "word": "islam",
          "pca_x": -9.22,
          "pca_y": -1.6941,
          "tsne_x": -6.3318,
          "tsne_y": 3.1687
        },
        {
          "word": "first",
          "pca_x": -0.4102,
          "pca_y": -2.9462,
          "tsne_x": -6.5048,
          "tsne_y": -0.3536
        },
        {
          "word": "islamic",
          "pca_x": -9.5105,
          "pca_y": -6.074,
          "tsne_x": -6.2705,
          "tsne_y": 1.8635
        },
        {
          "word": "obama",
          "pca_x": -1.7279,
          "pca_y": 6.3461,
          "tsne_x": -4.3677,
          "tsne_y": -4.2128
        },
        {
          "word": "look",
          "pca_x": 1.3634,
          "pca_y": 0.1161,
          "tsne_x": 0.5357,
          "tsne_y": -1.1874
        },
        {
          "word": "man",
          "pca_x": 0.1646,
          "pca_y": 3.2979,
          "tsne_x": 2.7633,
          "tsne_y": -1.3362
        },
        {
          "word": "bullying",
          "pca_x": 2.7821,
          "pca_y": -5.6747,
          "tsne_x": -0.482,
          "tsne_y": 5.2227
        },
        {
          "word": "mean",
          "pca_x": 0.8687,
          "pca_y": -1.2731,
          "tsne_x": 1.0414,
          "tsne_y": -0.1979
        },
        {
          "word": "female",
          "pca_x": 0.8081,
          "pca_y": 4.4647,
          "tsne_x": -0.9677,
          "tsne_y": -6.0064
        },
        {
          "word": "friend",
          "pca_x": 4.6746,
          "pca_y": -4.0516,
          "tsne_x": 1.0414,
          "tsne_y": 3.5378
        },
        {
          "word": "also",
          "pca_x": -0.262,
          "pca_y": -1.3301,
          "tsne_x": 0.2833,
          "tsne_y": 0.4643
        },
        {
          "word": "kid",
          "pca_x": 4.5366,
          "pca_y": -4.1427,
          "tsne_x": 0.8113,
          "tsne_y": 5.0338
        },
        {
          "word": "guy",
          "pca_x": 1.9609,
          "pca_y": -0.8704,
          "tsne_x": 0.7409,
          "tsne_y": 0.5346
        },
        {
          "word": "life",
          "pca_x": 0.7441,
          "pca_y": -2.5337,
          "tsne_x": 0.9687,
          "tsne_y": -4.2961
        },
        {
          "word": "good",
          "pca_x": -0.1874,
          "pca_y": -1.1528,
          "tsne_x": -0.8713,
          "tsne_y": 1.0103
        },
        {
          "word": "terrorism",
          "pca_x": -8.9503,
          "pca_y": -4.7475,
          "tsne_x": -7.1002,
          "tsne_y": 2.1501
        },
        {
          "word": "anything",
          "pca_x": 0.1329,
          "pca_y": -0.2517,
          "tsne_x": 4.9361,
          "tsne_y": -3.833
        },
        {
          "word": "cant",
          "pca_x": -1.8024,
          "pca_y": 1.7348,
          "tsne_x": -3.9417,
          "tsne_y": -0.7158
        },
        {
          "word": "love",
          "pca_x": 0.6773,
          "pca_y": -1.0759,
          "tsne_x": -1.8086,
          "tsne_y": -1.1498
        },
        {
          "word": "back",
          "pca_x": 2.4628,
          "pca_y": -2.6589,
          "tsne_x": -1.7451,
          "tsne_y": 2.3919
        },
        {
          "word": "way",
          "pca_x": 0.6624,
          "pca_y": -1.0343,
          "tsne_x": 0.2283,
          "tsne_y": 0.721
        },
        {
          "word": "day",
          "pca_x": 2.3706,
          "pca_y": -3.7941,
          "tsne_x": -0.5134,
          "tsne_y": 3.2495
        },
        {
          "word": "racist",
          "pca_x": -1.2773,
          "pca_y": 4.4733,
          "tsne_x": 2.4303,
          "tsne_y": -2.7375
        },
        {
          "word": "lol",
          "pca_x": 2.2185,
          "pca_y": 1.9204,
          "tsne_x": -1.7075,
          "tsne_y": -2.4215
        },
        {
          "word": "stop",
          "pca_x": -1.0323,
          "pca_y": 1.1356,
          "tsne_x": -2.6084,
          "tsne_y": -0.5713
        },
        {
          "word": "thats",
          "pca_x": -0.3166,
          "pca_y": 2.109,
          "tsne_x": -1.1795,
          "tsne_y": -2.1021
        },
        {
          "word": "radical",
          "pca_x": -9.376,
          "pca_y": -3.1599,
          "tsne_x": -4.4837,
          "tsne_y": 4.5513
        },
        {
          "word": "against",
          "pca_x": -5.6059,
          "pca_y": -1.9037,
          "tsne_x": 3.8811,
          "tsne_y": -1.9807
        },
        {
          "word": "youre",
          "pca_x": 0.1132,
          "pca_y": 3.2771,
          "tsne_x": -1.1965,
          "tsne_y": -2.7338
        },
        {
          "word": "sexist",
          "pca_x": -1.9065,
          "pca_y": 5.6545,
          "tsne_x": -0.8107,
          "tsne_y": -4.2456
        },
        {
          "word": "men",
          "pca_x": -0.3165,
          "pca_y": 2.5125,
          "tsne_x": 2.9954,
          "tsne_y": -1.0225
        },
        {
          "word": "made",
          "pca_x": 3.1997,
          "pca_y": -0.4167,
          "tsne_x": 2.7416,
          "tsne_y": 0.4906
        },
        {
          "word": "someone",
          "pca_x": 1.9576,
          "pca_y": 0.0184,
          "tsne_x": 1.7792,
          "tsne_y": 1.1524
        },
        {
          "word": "word",
          "pca_x": -1.5895,
          "pca_y": 3.4045,
          "tsne_x": 1.7304,
          "tsne_y": -2.8462
        },
        {
          "word": "going",
          "pca_x": 1.3111,
          "pca_y": -0.8539,
          "tsne_x": -1.5469,
          "tsne_y": 1.1662
        },
        {
          "word": "every",
          "pca_x": 0.8574,
          "pca_y": -2.0882,
          "tsne_x": -0.4769,
          "tsne_y": 2.1717
        },
        {
          "word": "bad",
          "pca_x": 1.5684,
          "pca_y": 0.3482,
          "tsne_x": 0.7237,
          "tsne_y": -0.0775
        },
        {
          "word": "funny",
          "pca_x": 2.9956,
          "pca_y": 3.0468,
          "tsne_x": 4.5215,
          "tsne_y": 0.4524
        },
        {
          "word": "na",
          "pca_x": 3.531,
          "pca_y": 2.4383,
          "tsne_x": -3.9263,
          "tsne_y": 0.1744
        },
        {
          "word": "racism",
          "pca_x": -4.3328,
          "pca_y": 2.5941,
          "tsne_x": 2.7701,
          "tsne_y": -2.942
        },
        {
          "word": "take",
          "pca_x": -0.1678,
          "pca_y": -0.3047,
          "tsne_x": -2.328,
          "tsne_y": 0.7261
        },
        {
          "word": "name",
          "pca_x": -1.559,
          "pca_y": -0.5316,
          "tsne_x": -4.196,
          "tsne_y": 1.1928
        },
        {
          "word": "let",
          "pca_x": -0.361,
          "pca_y": -0.1857,
          "tsne_x": -2.8446,
          "tsne_y": 0.4015
        },
        {
          "word": "much",
          "pca_x": 0.4555,
          "pca_y": -1.9598,
          "tsne_x": -0.3631,
          "tsne_y": 0.4273
        },
        {
          "word": "world",
          "pca_x": -4.2723,
          "pca_y": -3.0004,
          "tsne_x": -5.1745,
          "tsne_y": 1.8755
        },
        {
          "word": "always",
          "pca_x": 1.6773,
          "pca_y": -1.6826,
          "tsne_x": 0.3962,
          "tsne_y": 0.782
        },
        {
          "word": "country",
          "pca_x": -5.7598,
          "pca_y": -3.0614,
          "tsne_x": -5.0602,
          "tsne_y": 2.1919
        },
        {
          "word": "saying",
          "pca_x": -0.1468,
          "pca_y": 2.136,
          "tsne_x": 0.6623,
          "tsne_y": -2.1217
        },
        {
          "word": "isi",
          "pca_x": -8.261,
          "pca_y": -3.0161,
          "tsne_x": -6.4794,
          "tsne_y": 3.1777
        },
        {
          "word": "many",
          "pca_x": -1.0818,
          "pca_y": -3.6938,
          "tsne_x": -0.1033,
          "tsne_y": 1.5012
        },
        {
          "word": "tell",
          "pca_x": -0.2967,
          "pca_y": -0.0247,
          "tsne_x": -1.8295,
          "tsne_y": 0.0257
        },
        {
          "word": "well",
          "pca_x": -0.4028,
          "pca_y": -0.5055,
          "tsne_x": -1.1265,
          "tsne_y": 0.3882
        },
        {
          "word": "past",
          "pca_x": -0.0664,
          "pca_y": -1.63,
          "tsne_x": 4.9413,
          "tsne_y": -3.8664
        },
        {
          "word": "middle",
          "pca_x": 4.7964,
          "pca_y": -6.1931,
          "tsne_x": 1.4473,
          "tsne_y": 4.9577
        },
        {
          "word": "person",
          "pca_x": 0.4688,
          "pca_y": 0.667,
          "tsne_x": 1.7371,
          "tsne_y": -1.6085
        },
        {
          "word": "god",
          "pca_x": -2.7967,
          "pca_y": 1.3195,
          "tsne_x": -3.0536,
          "tsne_y": -1.5135
        },
        {
          "word": "ever",
          "pca_x": 0.5796,
          "pca_y": -1.587,
          "tsne_x": 0.5836,
          "tsne_y": 2.0499
        },
        {
          "word": "oh",
          "pca_x": 0.6249,
          "pca_y": 2.9185,
          "tsne_x": -2.053,
          "tsne_y": -2.2551
        },
        {
          "word": "feel",
          "pca_x": 2.2172,
          "pca_y": -0.4621,
          "tsne_x": 0.5274,
          "tsne_y": -0.6827
        },
        {
          "word": "come",
          "pca_x": -0.9477,
          "pca_y": -0.3332,
          "tsne_x": -2.1317,
          "tsne_y": 0.4614
        }
      ],
      "skipgram_coords": [
        {
          "word": "school",
          "pca_x": -0.2966,
          "pca_y": 0.0691,
          "tsne_x": 3.1968,
          "tsne_y": 5.2539
        },
        {
          "word": "\u2019",
          "pca_x": -0.4259,
          "pca_y": -0.4625,
          "tsne_x": 0.0476,
          "tsne_y": 0.5854
        },
        {
          "word": "not",
          "pca_x": 0.0534,
          "pca_y": -0.5073,
          "tsne_x": -0.0601,
          "tsne_y": 0.7518
        },
        {
          "word": "fuck",
          "pca_x": -1.0426,
          "pca_y": 2.0435,
          "tsne_x": 5.6454,
          "tsne_y": 1.8839
        },
        {
          "word": "like",
          "pca_x": -0.1847,
          "pca_y": -0.3408,
          "tsne_x": 0.1886,
          "tsne_y": 1.7735
        },
        {
          "word": "nigger",
          "pca_x": -0.6659,
          "pca_y": 2.5852,
          "tsne_x": 5.675,
          "tsne_y": 1.8941
        },
        {
          "word": "joke",
          "pca_x": -0.2796,
          "pca_y": 0.2721,
          "tsne_x": -4.151,
          "tsne_y": -4.7603
        },
        {
          "word": "girl",
          "pca_x": -0.6035,
          "pca_y": -0.2733,
          "tsne_x": 2.833,
          "tsne_y": 5.0278
        },
        {
          "word": "u",
          "pca_x": 0.6584,
          "pca_y": 0.0734,
          "tsne_x": -1.7089,
          "tsne_y": -0.3976
        },
        {
          "word": "dumb",
          "pca_x": -0.7054,
          "pca_y": 2.4542,
          "tsne_x": 5.7078,
          "tsne_y": 1.9512
        },
        {
          "word": "bully",
          "pca_x": -0.3201,
          "pca_y": 0.5148,
          "tsne_x": 3.6644,
          "tsne_y": 5.4573
        },
        {
          "word": "high",
          "pca_x": -0.535,
          "pca_y": 0.1644,
          "tsne_x": 2.9308,
          "tsne_y": 5.2693
        },
        {
          "word": "people",
          "pca_x": 0.1021,
          "pca_y": -0.6447,
          "tsne_x": -0.372,
          "tsne_y": 0.0656
        },
        {
          "word": "muslim",
          "pca_x": 1.1713,
          "pca_y": -0.4078,
          "tsne_x": -1.9504,
          "tsne_y": -2.1008
        },
        {
          "word": "bullied",
          "pca_x": -0.507,
          "pca_y": 0.3413,
          "tsne_x": 2.965,
          "tsne_y": 5.2567
        },
        {
          "word": "gay",
          "pca_x": -0.2798,
          "pca_y": 0.0126,
          "tsne_x": -4.1392,
          "tsne_y": -4.7713
        },
        {
          "word": "rape",
          "pca_x": -0.0256,
          "pca_y": 0.1871,
          "tsne_x": -4.1348,
          "tsne_y": -4.7886
        },
        {
          "word": "rt",
          "pca_x": -0.2817,
          "pca_y": 0.9533,
          "tsne_x": 3.5624,
          "tsne_y": 0.8858
        },
        {
          "word": "one",
          "pca_x": -0.125,
          "pca_y": -0.6694,
          "tsne_x": -0.7587,
          "tsne_y": 0.0344
        },
        {
          "word": "idiot",
          "pca_x": 0.8395,
          "pca_y": -0.18,
          "tsne_x": -1.8995,
          "tsne_y": -2.0927
        },
        {
          "word": "no",
          "pca_x": -0.124,
          "pca_y": -0.1348,
          "tsne_x": 1.8495,
          "tsne_y": -0.5087
        },
        {
          "word": "im",
          "pca_x": -0.8548,
          "pca_y": 0.3311,
          "tsne_x": 2.7321,
          "tsne_y": 0.2182
        },
        {
          "word": "dont",
          "pca_x": -0.0398,
          "pca_y": -0.3355,
          "tsne_x": -1.5514,
          "tsne_y": 1.6809
        },
        {
          "word": "woman",
          "pca_x": 0.302,
          "pca_y": -0.619,
          "tsne_x": 2.7398,
          "tsne_y": -2.117
        },
        {
          "word": "get",
          "pca_x": -0.54,
          "pca_y": -0.1024,
          "tsne_x": 2.267,
          "tsne_y": 2.8525
        },
        {
          "word": "\u201c",
          "pca_x": -0.6872,
          "pca_y": 0.2694,
          "tsne_x": 5.6867,
          "tsne_y": -2.4701
        },
        {
          "word": "black",
          "pca_x": -0.1678,
          "pca_y": 0.6673,
          "tsne_x": 0.0324,
          "tsne_y": -3.6756
        },
        {
          "word": "as",
          "pca_x": -0.8949,
          "pca_y": 2.017,
          "tsne_x": 5.7794,
          "tsne_y": 1.9503
        },
        {
          "word": "\u201d",
          "pca_x": -0.7258,
          "pca_y": 0.3376,
          "tsne_x": 5.6831,
          "tsne_y": -2.4653
        },
        {
          "word": "bitch",
          "pca_x": -0.8454,
          "pca_y": 1.4276,
          "tsne_x": 5.4699,
          "tsne_y": 0.2254
        },
        {
          "word": "know",
          "pca_x": 0.1256,
          "pca_y": -0.1877,
          "tsne_x": -0.137,
          "tsne_y": 1.2946
        },
        {
          "word": "mkr",
          "pca_x": -0.5223,
          "pca_y": 1.0623,
          "tsne_x": -0.1043,
          "tsne_y": 5.1349
        },
        {
          "word": "white",
          "pca_x": 0.261,
          "pca_y": 0.7114,
          "tsne_x": 0.2709,
          "tsne_y": -3.6267
        },
        {
          "word": "think",
          "pca_x": -0.3511,
          "pca_y": -0.3071,
          "tsne_x": 0.2303,
          "tsne_y": 1.2535
        },
        {
          "word": "right",
          "pca_x": 0.6032,
          "pca_y": -0.6197,
          "tsne_x": 2.7204,
          "tsne_y": -3.3387
        },
        {
          "word": "say",
          "pca_x": -0.045,
          "pca_y": -0.203,
          "tsne_x": 0.7435,
          "tsne_y": -0.5471
        },
        {
          "word": "make",
          "pca_x": -0.5547,
          "pca_y": -0.4815,
          "tsne_x": -4.5361,
          "tsne_y": 0.7049
        },
        {
          "word": "would",
          "pca_x": -0.4284,
          "pca_y": -0.5493,
          "tsne_x": -1.5622,
          "tsne_y": 0.7811
        },
        {
          "word": "christian",
          "pca_x": 1.8481,
          "pca_y": -0.111,
          "tsne_x": 2.8469,
          "tsne_y": -3.9796
        },
        {
          "word": "call",
          "pca_x": -0.4765,
          "pca_y": 0.4262,
          "tsne_x": 5.12,
          "tsne_y": -0.3255
        },
        {
          "word": "go",
          "pca_x": -0.6813,
          "pca_y": 0.069,
          "tsne_x": -1.2007,
          "tsne_y": 2.818
        },
        {
          "word": "time",
          "pca_x": -0.2542,
          "pca_y": -0.9489,
          "tsne_x": 2.5669,
          "tsne_y": 1.6843
        },
        {
          "word": "got",
          "pca_x": -0.5697,
          "pca_y": -0.2068,
          "tsne_x": 2.592,
          "tsne_y": 3.0338
        },
        {
          "word": "fucking",
          "pca_x": -1.0771,
          "pca_y": 1.0179,
          "tsne_x": 5.704,
          "tsne_y": 0.5723
        },
        {
          "word": "even",
          "pca_x": -0.1871,
          "pca_y": -1.1066,
          "tsne_x": -2.014,
          "tsne_y": 0.6774
        },
        {
          "word": "want",
          "pca_x": -0.3013,
          "pca_y": -0.2653,
          "tsne_x": -2.3454,
          "tsne_y": 1.6585
        },
        {
          "word": "never",
          "pca_x": 0.1813,
          "pca_y": -0.7409,
          "tsne_x": -0.2698,
          "tsne_y": 3.3624
        },
        {
          "word": "called",
          "pca_x": -0.1125,
          "pca_y": 0.0955,
          "tsne_x": 0.8998,
          "tsne_y": -3.1218
        },
        {
          "word": "see",
          "pca_x": -0.2337,
          "pca_y": -0.4094,
          "tsne_x": 0.0109,
          "tsne_y": 1.2437
        },
        {
          "word": "shit",
          "pca_x": -0.8749,
          "pca_y": 0.6424,
          "tsne_x": 3.8899,
          "tsne_y": 2.3195
        },
        {
          "word": "ur",
          "pca_x": 0.4107,
          "pca_y": -0.1667,
          "tsne_x": -2.3915,
          "tsne_y": -0.6577
        },
        {
          "word": "terrorist",
          "pca_x": 2.5517,
          "pca_y": 0.6973,
          "tsne_x": -5.0306,
          "tsne_y": -1.78
        },
        {
          "word": "thing",
          "pca_x": -0.2627,
          "pca_y": -0.7976,
          "tsne_x": 0.9261,
          "tsne_y": 0.5641
        },
        {
          "word": "still",
          "pca_x": -0.3932,
          "pca_y": -0.3186,
          "tsne_x": 1.6504,
          "tsne_y": 1.5334
        },
        {
          "word": "hate",
          "pca_x": -0.0083,
          "pca_y": -0.0091,
          "tsne_x": -1.6037,
          "tsne_y": 4.1322
        },
        {
          "word": "really",
          "pca_x": -0.6272,
          "pca_y": -0.4138,
          "tsne_x": 0.5491,
          "tsne_y": 1.2911
        },
        {
          "word": "need",
          "pca_x": -0.0908,
          "pca_y": -0.2641,
          "tsne_x": -3.2732,
          "tsne_y": 1.6589
        },
        {
          "word": "year",
          "pca_x": 0.1338,
          "pca_y": -0.7485,
          "tsne_x": 0.6671,
          "tsne_y": 6.0418
        },
        {
          "word": "said",
          "pca_x": -0.2377,
          "pca_y": 0.0643,
          "tsne_x": 1.1342,
          "tsne_y": -1.0167
        },
        {
          "word": "support",
          "pca_x": 1.7819,
          "pca_y": 0.1225,
          "tsne_x": 2.8163,
          "tsne_y": -4.6787
        },
        {
          "word": "islam",
          "pca_x": 2.1681,
          "pca_y": 0.2609,
          "tsne_x": -3.4282,
          "tsne_y": -2.1975
        },
        {
          "word": "first",
          "pca_x": 0.0769,
          "pca_y": -0.6053,
          "tsne_x": -2.4677,
          "tsne_y": -0.5915
        },
        {
          "word": "islamic",
          "pca_x": 3.4553,
          "pca_y": 0.9979,
          "tsne_x": 0.5152,
          "tsne_y": -6.569
        },
        {
          "word": "obama",
          "pca_x": -0.0041,
          "pca_y": 2.2938,
          "tsne_x": 6.2931,
          "tsne_y": 2.4281
        },
        {
          "word": "look",
          "pca_x": -0.6567,
          "pca_y": -0.0567,
          "tsne_x": 0.5305,
          "tsne_y": 4.0751
        },
        {
          "word": "man",
          "pca_x": 0.1299,
          "pca_y": -0.3851,
          "tsne_x": 2.2848,
          "tsne_y": -1.9643
        },
        {
          "word": "bullying",
          "pca_x": -0.2957,
          "pca_y": 2.5145,
          "tsne_x": 4.1793,
          "tsne_y": 5.8466
        },
        {
          "word": "mean",
          "pca_x": -0.0497,
          "pca_y": -0.2717,
          "tsne_x": -0.5689,
          "tsne_y": 1.5362
        },
        {
          "word": "female",
          "pca_x": -0.4184,
          "pca_y": 0.8434,
          "tsne_x": 5.164,
          "tsne_y": -0.4018
        },
        {
          "word": "friend",
          "pca_x": -0.121,
          "pca_y": -0.8568,
          "tsne_x": 1.6609,
          "tsne_y": 4.2409
        },
        {
          "word": "also",
          "pca_x": 0.1397,
          "pca_y": -0.8687,
          "tsne_x": -0.6833,
          "tsne_y": 0.6098
        },
        {
          "word": "kid",
          "pca_x": -0.2532,
          "pca_y": -0.3096,
          "tsne_x": 3.5719,
          "tsne_y": 4.3829
        },
        {
          "word": "guy",
          "pca_x": -0.0858,
          "pca_y": -0.6719,
          "tsne_x": 0.093,
          "tsne_y": 0.114
        },
        {
          "word": "life",
          "pca_x": 0.0897,
          "pca_y": -0.5633,
          "tsne_x": -3.227,
          "tsne_y": 4.6784
        },
        {
          "word": "good",
          "pca_x": -0.1737,
          "pca_y": -0.5432,
          "tsne_x": 1.2835,
          "tsne_y": 2.4241
        },
        {
          "word": "terrorism",
          "pca_x": 3.413,
          "pca_y": 0.749,
          "tsne_x": 0.5125,
          "tsne_y": -6.5693
        },
        {
          "word": "anything",
          "pca_x": -0.2165,
          "pca_y": -0.1775,
          "tsne_x": -1.6217,
          "tsne_y": -5.2576
        },
        {
          "word": "cant",
          "pca_x": -0.2189,
          "pca_y": -0.2146,
          "tsne_x": -2.5637,
          "tsne_y": 2.2943
        },
        {
          "word": "love",
          "pca_x": -0.437,
          "pca_y": -0.4651,
          "tsne_x": -1.0979,
          "tsne_y": 4.1219
        },
        {
          "word": "back",
          "pca_x": -0.4465,
          "pca_y": -0.1362,
          "tsne_x": 0.7145,
          "tsne_y": 3.0202
        },
        {
          "word": "way",
          "pca_x": -0.0731,
          "pca_y": -0.7426,
          "tsne_x": 0.6288,
          "tsne_y": 1.4837
        },
        {
          "word": "day",
          "pca_x": -0.2397,
          "pca_y": -0.6469,
          "tsne_x": 2.4144,
          "tsne_y": 1.6428
        },
        {
          "word": "racist",
          "pca_x": 0.0697,
          "pca_y": 0.7261,
          "tsne_x": -0.4126,
          "tsne_y": -3.6386
        },
        {
          "word": "lol",
          "pca_x": -0.7677,
          "pca_y": 0.1626,
          "tsne_x": 1.1212,
          "tsne_y": 1.0684
        },
        {
          "word": "stop",
          "pca_x": -0.306,
          "pca_y": -0.5209,
          "tsne_x": -0.0957,
          "tsne_y": -1.7305
        },
        {
          "word": "thats",
          "pca_x": -0.3772,
          "pca_y": -0.0019,
          "tsne_x": 1.1941,
          "tsne_y": 1.3474
        },
        {
          "word": "radical",
          "pca_x": 2.6859,
          "pca_y": 0.428,
          "tsne_x": 2.825,
          "tsne_y": -4.7021
        },
        {
          "word": "against",
          "pca_x": 1.0253,
          "pca_y": -0.3885,
          "tsne_x": -4.4019,
          "tsne_y": 2.6651
        },
        {
          "word": "youre",
          "pca_x": -0.8061,
          "pca_y": -0.255,
          "tsne_x": 2.3595,
          "tsne_y": 0.3048
        },
        {
          "word": "sexist",
          "pca_x": 0.067,
          "pca_y": 0.9655,
          "tsne_x": 3.4046,
          "tsne_y": -1.0179
        },
        {
          "word": "men",
          "pca_x": 0.1208,
          "pca_y": -0.4416,
          "tsne_x": 2.8658,
          "tsne_y": -1.9896
        },
        {
          "word": "made",
          "pca_x": -0.4421,
          "pca_y": -0.5984,
          "tsne_x": -4.5112,
          "tsne_y": 0.7001
        },
        {
          "word": "someone",
          "pca_x": -0.4312,
          "pca_y": -0.5748,
          "tsne_x": -0.5743,
          "tsne_y": -1.1138
        },
        {
          "word": "word",
          "pca_x": -0.0936,
          "pca_y": -0.2887,
          "tsne_x": 0.8089,
          "tsne_y": -1.6084
        },
        {
          "word": "going",
          "pca_x": -0.1761,
          "pca_y": -0.1351,
          "tsne_x": -1.2763,
          "tsne_y": 2.4416
        },
        {
          "word": "every",
          "pca_x": -0.2312,
          "pca_y": -0.6509,
          "tsne_x": -1.1927,
          "tsne_y": -0.4236
        },
        {
          "word": "bad",
          "pca_x": -0.1285,
          "pca_y": -0.3586,
          "tsne_x": 1.3765,
          "tsne_y": 2.5769
        },
        {
          "word": "funny",
          "pca_x": -0.5167,
          "pca_y": -0.0029,
          "tsne_x": -4.3181,
          "tsne_y": -4.451
        },
        {
          "word": "na",
          "pca_x": -0.7705,
          "pca_y": 1.1239,
          "tsne_x": -3.0521,
          "tsne_y": 3.3279
        },
        {
          "word": "racism",
          "pca_x": 1.0868,
          "pca_y": 0.9922,
          "tsne_x": -0.6872,
          "tsne_y": -3.7077
        },
        {
          "word": "take",
          "pca_x": -0.5656,
          "pca_y": -0.2304,
          "tsne_x": -2.1264,
          "tsne_y": 3.1592
        },
        {
          "word": "name",
          "pca_x": 0.4989,
          "pca_y": -0.5566,
          "tsne_x": -3.03,
          "tsne_y": 0.2199
        },
        {
          "word": "let",
          "pca_x": -0.0571,
          "pca_y": -0.1826,
          "tsne_x": -1.6015,
          "tsne_y": 2.2096
        },
        {
          "word": "much",
          "pca_x": -0.2242,
          "pca_y": -0.9902,
          "tsne_x": -1.0543,
          "tsne_y": 1.2378
        },
        {
          "word": "world",
          "pca_x": 1.3249,
          "pca_y": -0.1983,
          "tsne_x": -2.9278,
          "tsne_y": -2.0423
        },
        {
          "word": "always",
          "pca_x": -0.3242,
          "pca_y": -0.6056,
          "tsne_x": 0.4104,
          "tsne_y": 2.4614
        },
        {
          "word": "country",
          "pca_x": 1.1927,
          "pca_y": -0.2304,
          "tsne_x": -2.5588,
          "tsne_y": -2.1025
        },
        {
          "word": "saying",
          "pca_x": -0.0699,
          "pca_y": -0.124,
          "tsne_x": 0.6662,
          "tsne_y": -0.8275
        },
        {
          "word": "isi",
          "pca_x": 2.17,
          "pca_y": 0.6499,
          "tsne_x": -5.0012,
          "tsne_y": -1.7852
        },
        {
          "word": "many",
          "pca_x": 0.195,
          "pca_y": -0.8191,
          "tsne_x": -0.9181,
          "tsne_y": 0.3771
        },
        {
          "word": "tell",
          "pca_x": -0.0955,
          "pca_y": -0.1634,
          "tsne_x": 0.8396,
          "tsne_y": -0.2975
        },
        {
          "word": "well",
          "pca_x": 0.147,
          "pca_y": -0.3848,
          "tsne_x": 0.4191,
          "tsne_y": 1.8887
        },
        {
          "word": "past",
          "pca_x": 0.2256,
          "pca_y": 0.2424,
          "tsne_x": -1.6174,
          "tsne_y": -5.2613
        },
        {
          "word": "middle",
          "pca_x": -0.1179,
          "pca_y": -0.094,
          "tsne_x": 2.5866,
          "tsne_y": 5.5256
        },
        {
          "word": "person",
          "pca_x": -0.0744,
          "pca_y": -0.6923,
          "tsne_x": -0.4092,
          "tsne_y": -0.8509
        },
        {
          "word": "god",
          "pca_x": 0.1436,
          "pca_y": -0.5059,
          "tsne_x": -1.5147,
          "tsne_y": 5.632
        },
        {
          "word": "ever",
          "pca_x": -0.1291,
          "pca_y": -0.4673,
          "tsne_x": -0.2082,
          "tsne_y": 2.7739
        },
        {
          "word": "oh",
          "pca_x": -0.7679,
          "pca_y": -0.1957,
          "tsne_x": 1.5084,
          "tsne_y": 0.6419
        },
        {
          "word": "feel",
          "pca_x": -0.5905,
          "pca_y": -0.3395,
          "tsne_x": 0.5661,
          "tsne_y": 3.9282
        },
        {
          "word": "come",
          "pca_x": -0.2487,
          "pca_y": -0.5343,
          "tsne_x": -0.2551,
          "tsne_y": 1.9789
        }
      ]
    },
    "comparison": {
      "cbow": {
        "training_time_seconds": 1.61,
        "vocab_size": 14890,
        "vector_size": 100,
        "accuracy": 0.7849,
        "macro_f1": 0.7717,
        "semantic_similarities": {
          "bully": [
            {
              "word": "elementary",
              "similarity": 0.7536
            },
            {
              "word": "teacher",
              "similarity": 0.7471
            },
            {
              "word": "clowned",
              "similarity": 0.7422
            },
            {
              "word": "middle",
              "similarity": 0.7294
            },
            {
              "word": "parent",
              "similarity": 0.7246
            }
          ],
          "school": [
            {
              "word": "jr",
              "similarity": 0.829
            },
            {
              "word": "junior",
              "similarity": 0.7981
            },
            {
              "word": "royale",
              "similarity": 0.7792
            },
            {
              "word": "teacher",
              "similarity": 0.7719
            },
            {
              "word": "schoolhigh",
              "similarity": 0.7587
            }
          ],
          "hate": [
            {
              "word": "real",
              "similarity": 0.6662
            },
            {
              "word": "sarcasm",
              "similarity": 0.6563
            },
            {
              "word": "deblasio",
              "similarity": 0.6535
            },
            {
              "word": "proud",
              "similarity": 0.6451
            },
            {
              "word": "degrading",
              "similarity": 0.6366
            }
          ],
          "friend": [
            {
              "word": "crush",
              "similarity": 0.8201
            },
            {
              "word": "bc",
              "similarity": 0.7929
            },
            {
              "word": "remember",
              "similarity": 0.7895
            },
            {
              "word": "mom",
              "similarity": 0.7767
            },
            {
              "word": "instagram",
              "similarity": 0.7754
            }
          ],
          "threat": [
            {
              "word": "mass",
              "similarity": 0.9054
            },
            {
              "word": "violent",
              "similarity": 0.8938
            },
            {
              "word": "murder",
              "similarity": 0.8866
            },
            {
              "word": "false",
              "similarity": 0.883
            },
            {
              "word": "violence",
              "similarity": 0.8824
            }
          ],
          "people": [
            {
              "word": "folk",
              "similarity": 0.8008
            },
            {
              "word": "cop",
              "similarity": 0.7665
            },
            {
              "word": "oppressed",
              "similarity": 0.7514
            },
            {
              "word": "ppl",
              "similarity": 0.7504
            },
            {
              "word": "person",
              "similarity": 0.7354
            }
          ],
          "girl": [
            {
              "word": "nurse",
              "similarity": 0.8288
            },
            {
              "word": "clowned",
              "similarity": 0.8255
            },
            {
              "word": "liking",
              "similarity": 0.7987
            },
            {
              "word": "went",
              "similarity": 0.7966
            },
            {
              "word": "junior",
              "similarity": 0.7895
            }
          ],
          "boy": [
            {
              "word": "skinny",
              "similarity": 0.7958
            },
            {
              "word": "fat",
              "similarity": 0.7831
            },
            {
              "word": "liking",
              "similarity": 0.7764
            },
            {
              "word": "constantly",
              "similarity": 0.776
            },
            {
              "word": "dating",
              "similarity": 0.7755
            }
          ]
        }
      },
      "skipgram": {
        "training_time_seconds": 4.62,
        "vocab_size": 14890,
        "vector_size": 100,
        "accuracy": 0.7854,
        "macro_f1": 0.7697,
        "semantic_similarities": {
          "bully": [
            {
              "word": "elementary",
              "similarity": 0.7568
            },
            {
              "word": "playground",
              "similarity": 0.6955
            },
            {
              "word": "yard",
              "similarity": 0.6842
            },
            {
              "word": "secondary",
              "similarity": 0.6805
            },
            {
              "word": "school",
              "similarity": 0.6746
            }
          ],
          "school": [
            {
              "word": "elementary",
              "similarity": 0.7883
            },
            {
              "word": "highschool",
              "similarity": 0.781
            },
            {
              "word": "classmate",
              "similarity": 0.7639
            },
            {
              "word": "childhood",
              "similarity": 0.7564
            },
            {
              "word": "junior",
              "similarity": 0.749
            }
          ],
          "hate": [
            {
              "word": "ovechkin",
              "similarity": 0.5355
            },
            {
              "word": "adore",
              "similarity": 0.5314
            },
            {
              "word": "piss",
              "similarity": 0.5253
            },
            {
              "word": "filled",
              "similarity": 0.5248
            },
            {
              "word": "sarcasm",
              "similarity": 0.5238
            }
          ],
          "friend": [
            {
              "word": "crush",
              "similarity": 0.6346
            },
            {
              "word": "ex",
              "similarity": 0.6146
            },
            {
              "word": "mine",
              "similarity": 0.6126
            },
            {
              "word": "ended",
              "similarity": 0.6037
            },
            {
              "word": "royale",
              "similarity": 0.5915
            }
          ],
          "threat": [
            {
              "word": "brutal",
              "similarity": 0.7304
            },
            {
              "word": "internal",
              "similarity": 0.7156
            },
            {
              "word": "deadly",
              "similarity": 0.7022
            },
            {
              "word": "global",
              "similarity": 0.7011
            },
            {
              "word": "comparison",
              "similarity": 0.6976
            }
          ],
          "people": [
            {
              "word": "oppressed",
              "similarity": 0.6729
            },
            {
              "word": "dominant",
              "similarity": 0.6671
            },
            {
              "word": "theyd",
              "similarity": 0.6662
            },
            {
              "word": "relation",
              "similarity": 0.6572
            },
            {
              "word": "analogy",
              "similarity": 0.6531
            }
          ],
          "girl": [
            {
              "word": "tomboy",
              "similarity": 0.747
            },
            {
              "word": "bullied",
              "similarity": 0.7463
            },
            {
              "word": "middlehigh",
              "similarity": 0.7361
            },
            {
              "word": "shy",
              "similarity": 0.7317
            },
            {
              "word": "junior",
              "similarity": 0.7312
            }
          ],
          "boy": [
            {
              "word": "crack",
              "similarity": 0.6386
            },
            {
              "word": "miseducation",
              "similarity": 0.634
            },
            {
              "word": "sexy",
              "similarity": 0.5833
            },
            {
              "word": "girlfriend",
              "similarity": 0.5701
            },
            {
              "word": "jock",
              "similarity": 0.5609
            }
          ]
        }
      },
      "analogies": [
        {
          "analogy": "hate:attack :: love:?",
          "cbow_prediction": "blab",
          "cbow_score": 0.7163,
          "sg_prediction": "humanityif",
          "sg_score": 0.5398
        },
        {
          "analogy": "school:college :: student:?",
          "cbow_prediction": "senior",
          "cbow_score": 0.8336,
          "sg_prediction": "witnessed",
          "sg_score": 0.5528
        }
      ]
    }
  },
  "preprocessing": {
    "demonstration": {
      "original_text": "Hey @alex! Check this out: https://example.com/test #TeamSpirit... You are definitely not qualified for this project \ud83d\ude21\ud83d\udc4e!! #epicfail",
      "step1_url_mention_emoji_normalized": "Hey ! Check this out: TeamSpirit ... You are definitely not qualified for this project angry_face thumbs_down !! epicfail",
      "step2_lowercased": "hey ! check this out: teamspirit ... you are definitely not qualified for this project angry_face thumbs_down !! epicfail",
      "step3_punct_removed": "hey check this out teamspirit you are definitely not qualified for this project angryface thumbsdown epicfail",
      "step4_tokens": [
        "hey",
        "check",
        "this",
        "out",
        "teamspirit",
        "you",
        "are",
        "definitely",
        "not",
        "qualified",
        "for",
        "this",
        "project",
        "angryface",
        "thumbsdown",
        "epicfail"
      ],
      "step5_stopwords_filtered_preserving_negation": [
        "hey",
        "check",
        "teamspirit",
        "definitely",
        "not",
        "qualified",
        "project",
        "angryface",
        "thumbsdown",
        "epicfail"
      ],
      "step6_lemmatized": [
        "hey",
        "check",
        "teamspirit",
        "definitely",
        "not",
        "qualified",
        "project",
        "angryface",
        "thumbsdown",
        "epicfail"
      ],
      "step7_stemmed": [
        "hey",
        "check",
        "teamspirit",
        "definit",
        "not",
        "qualifi",
        "project",
        "angryfac",
        "thumbsdown",
        "epicfail"
      ],
      "classical_pipeline_output": "hey check teamspirit definitely not qualified project angryface thumbsdown epicfail",
      "transformer_pipeline_output": "Hey [USER] ! Check this out: [URL] TeamSpirit... You are definitely not qualified for this project angry_face thumbs_down !! epicfail"
    },
    "tradeoffs": {
      "Aggressive Stop-Word Removal": "Standard stop-word lists drop words like 'not', 'no', 'never', 'against', and 'why'. In harmful language detection, stripping negations completely inverts semantics (e.g., 'not a bully' becomes 'bully', causing severe false positive inflation). ShieldText utilizes negation-preserving stopword filtering.",
      "Stemming vs. Lemmatization": "Stemmers (such as PorterStemmer) apply heuristic suffix truncation, producing non-words (e.g., 'community' -> 'commun', 'university' -> 'univers'). Lemmatization maps words to valid dictionary lemmas using morphological and lexical vocabulary (WordNet), preserving interpretability and semantic validity for embeddings.",
      "Punctuation Stripping in Deep Models": "While removing punctuation reduces vocabulary size for sparse Bag-of-Words/TF-IDF models, transformers like BERT rely on punctuation (question marks, exclamation points, quotation marks) to understand conversational syntax, emotional escalation, rhetorical sarcasm, and sentence boundaries.",
      "Emoji and Social Shorthand Loss": "Simply deleting non-ASCII characters discards crucial sentiment indicators (e.g., \ud83d\ude21, \ud83e\udd2e, \ud83d\udc80). ShieldText translates common affective emojis into semantic token representations ('angry_face', 'disgusted_face') before vocabulary mapping."
    }
  },
  "info": {
    "project_name": "ShieldText",
    "subtitle": "An NLP-Based Cyberbullying Detection and Classification System",
    "course": "CSE472 \u2014 Deep Learning for Natural Language Processing",
    "academic_session": "2026\u201327",
    "dataset_source": "Wang et al. (2021) Cyberbullying Tweets Dataset (47,692 records, 6 balanced classes)",
    "course_mapping": [
      {
        "code": "CO1",
        "title": "Linguistic Foundations & Preprocessing",
        "implementation": "Complete modular preprocessing pipeline including URL/mention normalization, negation-preserving stopword removal, Porter stemming, WordNet lemmatization, and emoji translation.",
        "status": "Fully Implemented"
      },
      {
        "code": "CO2",
        "title": "Distributed Representations & Word Embeddings",
        "implementation": "Gensim Word2Vec CBOW vs. Skip-Gram architectures, cosine semantic similarity metrics, word analogy vector arithmetic, and 2D dimensionality reduction using PCA and t-SNE.",
        "status": "Fully Implemented"
      },
      {
        "code": "CO3",
        "title": "Recurrent Sequence Modeling (LSTM & BiLSTM)",
        "implementation": "PyTorch deep recurrent neural classifiers with embedding initialization from Word2Vec, dropout, masked pooling over variable length sequences, and comparative benchmarking of unidirectional vs. bidirectional LSTM.",
        "status": "Fully Implemented"
      },
      {
        "code": "CO4",
        "title": "Attention Mechanisms in NLP",
        "implementation": "Additive self-attention mechanism over BiLSTM hidden states. Extracts token attention distribution for explainability visualization in the web application.",
        "status": "Fully Implemented"
      },
      {
        "code": "CO5",
        "title": "Transformer Encoders & BERT Fine-Tuning",
        "implementation": "Pretrained DistilBERT/BERT sequence classification head fine-tuned with AdamW and linear warmup, preserving full casing, subwords (WordPiece), and punctuation context.",
        "status": "Fully Implemented"
      },
      {
        "code": "CO6",
        "title": "Responsible AI, Evaluation & Limitations",
        "implementation": "Comprehensive evaluation (macro/weighted F1, confusion matrices, class reports), feature attribution, occlusion sensitivity, non-retention by default, and decision-support safeguards.",
        "status": "Fully Implemented"
      }
    ],
    "responsible_ai_safeguards": [
      {
        "title": "Decision Support, Not Automated Sanction",
        "description": "Model predictions indicate statistical correlation with corpus annotations and must never automatically ban, censor, or punish users without human review."
      },
      {
        "title": "Sarcasm and Cultural Nuance Limitations",
        "description": "Social media language exhibits deep cultural nuance, reclaimed colloquialisms, and irony that bag-of-words or static embeddings may misclassify as offensive."
      },
      {
        "title": "Privacy and Non-Retention Policy",
        "description": "Text submitted through live or batch inference is evaluated transiently in-memory and is never stored, logged, or serialized to persistent databases."
      },
      {
        "title": "Separation of Offensiveness from Cyberbullying",
        "description": "Ordinary negative language or isolated profanity is distinguished from systematic identity-targeted cyberbullying (religion, ethnicity, gender, age)."
      }
    ]
  }
};
