/* Canonical editable visual profiles for the shared exercise templates.
 * Approved template appearance: 2026-10-18.
 * Keep lesson content, answer keys, media, progression and saved state out of this file.
 * A compound template lists its primitive parts; paths describe the catalog shape,
 * while the registry matches compatible lesson components without replacing their data.
 */
(function (root, factory) {
  'use strict';
  const profiles = factory();
  if (typeof module === 'object' && module.exports) module.exports = profiles;
  if (root) root.SpaceWhaleExerciseTemplateProfiles = profiles;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
  "W01": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "picture-word"
        }
      }
    ]
  },
  "W02": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "word-translation"
        }
      }
    ]
  },
  "W03A": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "word-definition"
        }
      }
    ]
  },
  "W03B": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"part-1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"part-2\"].exercise",
        "kind": "matching",
        "settings": {
          "layout": "word-definition"
        }
      }
    ]
  },
  "W04": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "image-label",
        "settings": {}
      }
    ]
  },
  "W05": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "word-definition"
        }
      }
    ]
  },
  "P01": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "audio",
        "settings": {
          "layout": "listen-repeat"
        }
      }
    ]
  },
  "P02": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "audio",
        "settings": {
          "layout": "listen-repeat"
        }
      }
    ]
  },
  "D01": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "rule-page",
        "settings": {}
      },
      {
        "path": "$.blocks[1].exercise",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      },
      {
        "path": "legacy-choice",
        "kind": "choice",
        "settings": {
          "layout": "dropdown"
        }
      },
      {
        "path": "oral-conclusion",
        "kind": "presentation",
        "settings": {}
      }
    ]
  },
  "D02": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "rule-page",
        "settings": {}
      },
      {
        "path": "$.blocks[1].exercise",
        "kind": "choice",
        "settings": {
          "layout": "dropdown"
        }
      },
      {
        "path": "legacy-inline-meaning",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "D03": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"part-1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"part-2\"].exercise",
        "kind": "sort",
        "settings": {}
      }
    ]
  },
  "D04": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"part-1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"part-2\"].exercise",
        "kind": "matching",
        "settings": {
          "layout": "stacked-text"
        }
      }
    ]
  },
  "R01": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "rule-page",
        "settings": {}
      }
    ]
  },
  "R02": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "rule-page",
        "settings": {}
      }
    ]
  },
  "R03": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "rule-page",
        "settings": {}
      }
    ]
  },
  "R04": {
    "flatControls": false,
    "parts": [
      {
        "path": "$",
        "kind": "rule-page",
        "settings": {}
      }
    ]
  },
  "S01": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "presentation",
        "settings": {
          "layout": "speaking"
        }
      }
    ]
  },
  "S02": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "presentation",
        "settings": {
          "layout": "speaking"
        }
      }
    ]
  },
  "Q01": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "presentation",
        "settings": {}
      }
    ]
  },
  "Q02": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"facts\"].exercise",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "E01": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "choice",
        "settings": {
          "layout": "list"
        }
      }
    ]
  },
  "E02": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "choice",
        "settings": {
          "layout": "list"
        }
      }
    ]
  },
  "E03": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "E03A": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "gaps",
        "settings": {
          "layout": "paragraph"
        }
      }
    ]
  },
  "E03B": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "E04": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "E04A": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "E05": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "E05A": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "writing",
        "settings": {
          "layout": "inline",
          "answerSize": "word",
          "transformationArrow": true
        }
      }
    ]
  },
  "E05B": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "gaps",
        "settings": {
          "layout": "table"
        }
      }
    ]
  },
  "E06": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "stacked-text"
        }
      }
    ]
  },
  "E06A": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "stacked-text"
        }
      }
    ]
  },
  "E06B": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "stacked-text"
        }
      }
    ]
  },
  "E06C": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "word-definition"
        }
      }
    ]
  },
  "E06D": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "picture-word",
          "answerSize": "sentence"
        }
      }
    ]
  },
  "E06E": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "picture-word",
          "answerSize": "sentence"
        }
      }
    ]
  },
  "E06F": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "stacked-text"
        }
      }
    ]
  },
  "E06G": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "stacked-text"
        }
      }
    ]
  },
  "E07": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "sort",
        "settings": {}
      }
    ]
  },
  "E08": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "order",
        "settings": {
          "layout": "tokens"
        }
      }
    ]
  },
  "E09": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "order",
        "settings": {
          "layout": "tokens"
        }
      }
    ]
  },
  "E11": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "writing",
        "settings": {}
      }
    ]
  },
  "E11A": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "presentation",
        "settings": {
          "layout": "speaking"
        }
      }
    ]
  },
  "E12": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "writing",
        "settings": {
          "layout": "inline",
          "answerSize": "word",
          "transformationArrow": true
        }
      }
    ]
  },
  "E13": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "writing",
        "settings": {
          "layout": "inline",
          "transformationArrow": true
        }
      }
    ]
  },
  "E14": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "writing",
        "settings": {}
      }
    ]
  },
  "E15": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "writing",
        "settings": {}
      }
    ]
  },
  "E16": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "writing",
        "settings": {}
      }
    ]
  },
  "E17": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"time\"].exercise",
        "kind": "writing",
        "settings": {}
      },
      {
        "path": "$.exercises[\"place\"].exercise",
        "kind": "writing",
        "settings": {}
      },
      {
        "path": "$.exercises[\"bring\"].exercise",
        "kind": "writing",
        "settings": {}
      }
    ]
  },
  "L01": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "dropdown",
          "numbered": true
        }
      },
      {
        "path": "legacy-true-false",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "L02": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "list"
        }
      }
    ]
  },
  "L03": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "image-grid"
        }
      }
    ]
  },
  "L04": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "image-grid"
        }
      }
    ]
  },
  "L05": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "order",
        "settings": {
          "layout": "image-grid"
        }
      }
    ]
  },
  "L06": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "order",
        "settings": {
          "layout": "tokens"
        }
      }
    ]
  },
  "L07": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "L08": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "L09": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "L10": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "matching",
        "settings": {
          "layout": "word-definition"
        }
      }
    ]
  },
  "L11": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "matching",
        "settings": {
          "layout": "audio-picture"
        }
      }
    ]
  },
  "L12": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "writing",
        "settings": {}
      }
    ]
  },
  "L13": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "list"
        }
      }
    ]
  },
  "L14": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "sort",
        "settings": {}
      }
    ]
  },
  "L15": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "image-label",
        "settings": {}
      }
    ]
  },
  "L16": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "order",
        "settings": {
          "layout": "tokens"
        }
      },
      {
        "path": "$.exercises[\"check-audio\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      }
    ]
  },
  "L17": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "list"
        }
      }
    ]
  },
  "L18": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "audio",
        "settings": {
          "layout": "player"
        }
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "writing",
        "settings": {}
      }
    ]
  },
  "T01": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "dropdown",
          "numbered": true
        }
      }
    ]
  },
  "T02": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "list"
        }
      }
    ]
  },
  "T03": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "image-grid"
        }
      }
    ]
  },
  "T04": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "choice",
        "settings": {
          "layout": "image-grid"
        }
      }
    ]
  },
  "T05": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "order",
        "settings": {
          "layout": "image-grid"
        }
      }
    ]
  },
  "T06": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "order",
        "settings": {
          "layout": "tokens"
        }
      }
    ]
  },
  "T07": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "writing",
        "settings": {}
      }
    ]
  },
  "T08": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "T09": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "T10": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "gaps",
        "settings": {
          "layout": "sentences"
        }
      }
    ]
  },
  "T11": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "stage",
        "settings": {}
      },
      {
        "path": "$.exercises[\"source1\"].exercise",
        "kind": "presentation",
        "settings": {}
      },
      {
        "path": "$.exercises[\"task\"].exercise",
        "kind": "matching",
        "settings": {
          "layout": "word-definition"
        }
      }
    ]
  },
  "T12": {
    "flatControls": true,
    "parts": [
      {
        "path": "$",
        "kind": "matching",
        "settings": {
          "layout": "stacked-text"
        }
      }
    ]
  }
};
});
