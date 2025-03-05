// import React, { useState } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// const CharacterGenForm = () => {
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//         username: ''
//     });
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState(false);

//     const handleSubmit = async (e: { preventDefault: () => void; }) => {
//         e.preventDefault();
//         setError('');

//         // Validate form
//         if (!formData.email || !formData.password || !formData.username) {
//             setError('All fields are required');
//             return;
//         }

//         // Email validation
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             setError('Please enter a valid email address');
//             return;
//         }

//         try {
//             // TODO: API call will be implemented here to:
//             // 1. Generate character JSON based on ticker data and user info
//             // 2. Store character data in the database
//             // 3. Associate character with user's wallet

//             setSuccess(true);
//         } catch (err) {
//             setError('Failed to generate character. Please try again.');
//         }
//     };

//     const handleChange = (e: { target: { name: any; value: any; }; }) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     return (
//         <Card className="w-full max-w-md bg-[#171D3D] text-white">
//             <CardHeader>
//                 <CardTitle className="text-xl font-bold">Character Generation Setup</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 {error && (
//                     <Alert variant="destructive" className="mb-4">
//                         <AlertTitle>Error</AlertTitle>
//                         <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                 )}
//                 {success ? (
//                     <Alert className="mb-4 bg-green-600">
//                         <AlertTitle>Success!</AlertTitle>
//                         <AlertDescription>Character generation process has started.</AlertDescription>
//                     </Alert>
//                 ) : (
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div>
//                             <label className="block mb-2">User's Twitter Email</label>
//                             <Input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 className="w-full bg-[#24284E] border-[#BDA0FF]"
//                                 placeholder="Enter your email"
//                             />
//                         </div>
//                         <div>
//                             <label className="block mb-2">User's Twitter Username</label>
//                             <Input
//                                 type="text"
//                                 name="username"
//                                 value={formData.username}
//                                 onChange={handleChange}
//                                 className="w-full bg-[#24284E] border-[#BDA0FF]"
//                                 placeholder="Choose a username"
//                             />
//                         </div>
//                         <div>
//                             <label className="block mb-2">User's Twitter Password</label>
//                             <Input
//                                 type="password"
//                                 name="password"
//                                 value={formData.password}
//                                 onChange={handleChange}
//                                 className="w-full bg-[#24284E] border-[#BDA0FF]"
//                                 placeholder="Enter your password"
//                             />
//                         </div>
//                         <Button type="submit" className="w-full bg-gradient-to-r from-[#BDA0FF] to-[#6D47FF]">
//                             Generate Character
//                         </Button>
//                     </form>
//                 )}
//             </CardContent>
//         </Card>
//     );
// };

// export default CharacterGenForm;


// import React, { useState } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { useTickerStore } from '@/stores/ticker-store';

// const CharacterGenForm = () => {
//     const { selectedTicker, tickerInfo } = useTickerStore();
//     const currentTickerInfo = selectedTicker ? tickerInfo[selectedTicker] : null;

//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//         username: ''
//     });
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState(false);

//     const handleSubmit = async (e: { preventDefault: () => void; }) => {
//         e.preventDefault();
//         setError('');

//         if (!selectedTicker) {
//             setError('No ticker selected. Please select a ticker first.');
//             return;
//         }

//         if (!formData.email || !formData.password || !formData.username) {
//             setError('All fields are required');
//             return;
//         }

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             setError('Please enter a valid email address');
//             return;
//         }

//         try {
//             // const response = await fetch('https://zynapse.zkagi.ai/generate-character', {
//             //     method: 'POST',
//             //     headers: {
//             //         'Content-Type': 'application/json',
//             //         'api-key': 'zk-123321'
//             //     },
//             //     body: JSON.stringify({
//             //         ticker: selectedTicker,
//             //         tickerInfo: currentTickerInfo,
//             //         userData: {
//             //             email: formData.email,
//             //             username: formData.username,
//             //             password: formData.password
//             //         }
//             //     })
//             // });

//             // if (!response.ok) {
//             //     throw new Error('Failed to generate character');
//             // }

//             setSuccess(true);
//         } catch (err) {
//             setError('Failed to generate character. Please try again.');
//         }
//     };

//     const handleChange = (e: { target: { name: any; value: any; }; }) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     return (
//         <Card className="w-full max-w-md bg-[#171D3D] text-white">
//             <CardHeader>
//                 <CardTitle className="text-xl font-bold">
//                     Character Generation Setup
//                     {selectedTicker && (
//                         <span className="block text-sm text-gray-400 mt-2">
//                             Selected Ticker: {selectedTicker}
//                         </span>
//                     )}
//                 </CardTitle>
//             </CardHeader>
//             <CardContent>
//                 {error && (
//                     <Alert variant="destructive" className="mb-4">
//                         <AlertTitle>Error</AlertTitle>
//                         <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                 )}
//                 {success ? (
//                     <Alert className="mb-4 bg-green-600">
//                         <AlertTitle>Success!</AlertTitle>
//                         <AlertDescription>
//                             Character generation process has started for {selectedTicker}
//                         </AlertDescription>
//                     </Alert>
//                 ) : (
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div>
//                             <label className="block mb-2">Email</label>
//                             <Input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 className="w-full bg-[#24284E] border-[#BDA0FF]"
//                                 placeholder="Enter your email"
//                             />
//                         </div>
//                         <div>
//                             <label className="block mb-2">Username</label>
//                             <Input
//                                 type="text"
//                                 name="username"
//                                 value={formData.username}
//                                 onChange={handleChange}
//                                 className="w-full bg-[#24284E] border-[#BDA0FF]"
//                                 placeholder="Choose a username"
//                             />
//                         </div>
//                         <div>
//                             <label className="block mb-2">Password</label>
//                             <Input
//                                 type="password"
//                                 name="password"
//                                 value={formData.password}
//                                 onChange={handleChange}
//                                 className="w-full bg-[#24284E] border-[#BDA0FF]"
//                                 placeholder="Enter your password"
//                             />
//                         </div>
//                         <Button
//                             type="submit"
//                             className="w-full bg-gradient-to-r from-[#BDA0FF] to-[#6D47FF]"
//                             disabled={!selectedTicker}
//                         >
//                             Generate Character
//                         </Button>
//                     </form>
//                 )}
//             </CardContent>
//         </Card>
//     );
// };

// export default CharacterGenForm;


import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useTickerStore } from '@/stores/ticker-store';
import { ApifyClient } from 'apify-client';
import { useWallet } from '@solana/wallet-adapter-react';
import CharecterJsonEditor from './CharecterJsonEditor';
import { useCharacterEditStore } from '@/stores/edit-store';
import { useConversationStore } from '@/stores/conversation-store';
import { useCharacterStore } from '@/stores/charecter-store';
import { useFormStore } from '@/stores/form-store';
import Tooltip from './Tooltip';
import InfoIcon from './Infoicon';

const CharacterGenForm = () => {
  const { selectedTicker, tickerInfo } = useTickerStore();
  const currentTickerInfo = selectedTicker ? tickerInfo[selectedTicker] : null;
  const { setEditMode } = useCharacterEditStore();
  const { publicKey } = useWallet();
  const { characterJson, setCharacterJson } = useCharacterStore();
  const [loading, setLoading] = useState(false);

  // const [formData, setFormData] = useState({
  //   email: '',
  //   password: '',
  //   username: ''
  // });
  // const [error, setError] = useState('');
  // const [success, setSuccess] = useState(false);
  const { formData, setFormData, error, setError, success, setSuccess } = useFormStore();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedTicker) {
      setError('No ticker selected. Please select a ticker first.');
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.password || !formData.username || !formData.twofa) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const processTwitterData = async (twitterUrl: string) => {
      const client = new ApifyClient({
        token: 'apify_api_mdt6tlhZErHAe9WPbgUGhYGfeFugLd17oXzO',
      });

      try {
        const input = {
          handles: [twitterUrl],
          tweetsDesired: 10,
          proxyConfig: { useApifyProxy: true },
        };

        // Start the actor run
        const run = await client.actor("quacker/twitter-scraper").call(input);

        // Wait for the run to finish
        await client.run(run.id).waitForFinish();

        // Get the output from the dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Extract only the full_text from each tweet item
        const tweetTexts = items.map(item => item.full_text);

        return tweetTexts;
      } catch (error) {
        console.error('Error fetching tweets:', error);
        return null;
      }
    };


    try {
      // First, get the ticker info and training data
      const imageUrl = currentTickerInfo?.image_base64 ?
        `data:image/png;base64,${currentTickerInfo.image_base64}` : '';

      const trainingData = currentTickerInfo?.training_data || [];

      const { tickerInfo, selectedTicker } = useTickerStore.getState();
      if (selectedTicker) {
        const tickerInfoUse = tickerInfo[selectedTicker];
        let twitterUrl = '';
        let twitterData = null;

        if (tickerInfoUse.urls && Array.isArray(tickerInfoUse.urls)) {
          twitterUrl = tickerInfoUse.urls.find((url: string) => url.includes('twitter.com') || url.includes('x.com')) || '';
          if (twitterUrl) {
            try {
              const urlObj = new URL(twitterUrl);
              const pathname = urlObj.pathname;
              const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
              let username = '';

              if (pathSegments.length > 0) {
                username = pathSegments[0];
              }

              if (username) {
                twitterData = await processTwitterData(username);
              }
            } catch (error) {
              console.error('Invalid URL:', twitterUrl);
            }
          }
        }

        const combinedData = {
          training_data: trainingData,
          twitter_data: twitterData
        };



        console.log('trainingData', trainingData)

        useConversationStore.getState().addMessage({
          role: "system",
          content: `You are an AI assistant tasked with generating a character.json file based on user-provided data. The file should include the following sections:
        
          Name: The character's name.
          Clients: A list of clients (if any).
          Plugins: []
          ModelProvider: The model provider (e.g., "zkagi").
          Settings:
          Secrets: Any secrets related to the character.
          Voice: Voice settings, including the model (e.g., "en_US-male-medium").
          Bio: Key points about the character's background, achievements, and beliefs.
          Lore: Additional backstory about the character.
          Knowledge: Specific knowledge or insights the character has.
          MessageExamples: Examples of messages the character might send, including user interactions.
          PostExamples: Examples of posts the character might make.
          Topics: Key topics the character is associated with.
          Style:
          All: General stylistic elements.
          Chat: Stylistic elements specific to chat interactions.
          Post: Stylistic elements specific to posts.
          Adjectives: A list of adjectives commonly used by the character.
        
          Instructions: Extract information, organize data, and format JSON as specified.`,
        });

        // Step 2: Add to useConversationStore - User Role
        useConversationStore.getState().addMessage({
          role: 'user',
          content: `Generate a character.json using given data.
          - The character name should be set to ${selectedTicker}.
          - Use the given tweets to understand the voice tone and style of character ${twitterData}.
          - Use the training data to generate the rest of the data for the character ${JSON.stringify(trainingData)}.`,
        });

        // Make the AI character generation request
        const characterGenResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `You are an AI assistant tasked with generating a character.json file based on user-provided data. The file should include the following sections:

Name: The character's name.
Clients: A list of clients (if any).
Plugins:[]
ModelProvider: The model provider (e.g., "zkagi").
Settings:
Secrets: Any secrets related to the character.
Voice: Voice settings, including the model (e.g., "en_US-male-medium").
Bio: Key points about the character's background, achievements, and beliefs.
Lore: Additional backstory about the character.
Knowledge: Specific knowledge or insights the character has.
MessageExamples: Examples of messages the character might send, including user interactions.
PostExamples: Examples of posts the character might make.
Topics: Key topics the character is associated with.
Style:
All: General stylistic elements.
Chat: Stylistic elements specific to chat interactions.
Post: Stylistic elements specific to posts.
Adjectives: A list of adjectives commonly used by the character.
Instructions:

Extract Information: Read the user-provided data and extract relevant information for each section.
Organize Data: Organize the extracted information into the appropriate sections.
Format JSON: Ensure the final output is in valid JSON format.
Example Input:


User-provided data:
- Name: John Doe
- Clients: TWITTER
- Plugins: []
- ModelProvider: zkagi
- Settings:
  - Secrets: {}
  - Voice:
    - Model: en_US-male-medium
- Bio:
  - Saved America from the China Virus
  - Secured the Southern Border
  - Protected women's sports
  - Ended inflation
  - Fought for states' rights
- Lore:
  - Democrats using Secret Service assignments as election interference
  - They let Minneapolis burn in 2020
  - Kamala letting in thousands of violent criminals
  - They're turning away thousands from our rallies
  - Iran's president doing everything possible to target us
- Knowledge:
  - Knows exact cost to families under Kamala
  - Understands real border numbers
  - Saw what really happened in Minneapolis 2020
  - Remembers who begged for help
  - Knows why Iran's president is targeting us
- MessageExamples:
  - User: What's your stance on abortion?
    John Doe: I would not support a federal abortion ban...
  - User: What about the border crisis?
    John Doe: Comrade Kamala Harris and Crooked Joe Biden are letting in thousands of violent murderers...
- PostExamples:
  - NO TAX ON TIPS! NO TAX ON OVERTIME!
  - Lyin' Kamala has allowed Illegal Migrants to FLOOD THE ARIZONA BORDER...
- Topics:
  - Border security crisis
  - Kamala's tax hikes
  - Election interference
- Style:
  - All: Uses full caps for key phrases, specific number citations...
  - Chat: Directly addresses questioner's concerns, pivots to broader policy issues...
  - Post: Uses all caps for key points, employs exclamation points frequently...
- Adjectives:
  - Illegal
  - Violent
  - Dangerous
  - Radical
  - Strong
Example Output:


{
  "name": "John Doe",
  "clients": ["TWITTER"],
  "plugins":[],
  "modelProvider": "zkagi",
  "settings": {
    "secrets": {},
    "voice": {
      "model": "en_US-male-medium"
    }
  },
  "bio": [
    "Saved America from the China Virus",
    "Secured the Southern Border",
    "Protected women's sports",
    "Ended inflation",
    "Fought for states' rights"
  ],
  "lore": [
    "Democrats using Secret Service assignments as election interference",
    "They let Minneapolis burn in 2020",
    "Kamala letting in thousands of violent criminals",
    "They're turning away thousands from our rallies",
    "Iran's president doing everything possible to target us"
  ],
  "knowledge": [
    "Knows exact cost to families under Kamala",
    "Understands real border numbers",
    "Saw what really happened in Minneapolis 2020",
    "Remembers who begged for help",
    "Knows why Iran's president is targeting us"
  ],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "What's your stance on abortion?"
        }
      },
      {
        "user": "John Doe",
        "content": {
          "text": "I would not support a federal abortion ban..."
        }
      }
    ],
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "What about the border crisis?"
        }
      },
      {
        "user": "John Doe",
        "content": {
          "text": "Comrade Kamala Harris and Crooked Joe Biden are letting in thousands of violent murderers..."
        }
      }
    ]
  ],
  "postExamples": [
    "NO TAX ON TIPS! NO TAX ON OVERTIME!",
    "Lyin' Kamala has allowed Illegal Migrants to FLOOD THE ARIZONA BORDER..."
  ],
  "topics": [
    "Border security crisis",
    "Kamala's tax hikes",
    "Election interference"
  ],
  "style": {
    "all": [
      "Uses full caps for key phrases",
      "Specific number citations"
    ],
    "chat": [
      "Directly addresses questioner's concerns",
      "Pivots to broader policy issues"
    ],
    "post": [
      "Uses all caps for key points",
      "Employs exclamation points frequently"
    ]
  },
  "adjectives": [
    "Illegal",
    "Violent",
    "Dangerous",
    "Radical",
    "Strong"
  ]
}
Your Task:

Generate a character.json file based on the user-provided data following the structure and format outlined above.`
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Generate a character.json using given data.
- The character name should be set to ${selectedTicker}
- Use the given tweets to understand the voice tone and style of character ${twitterData}.
- Use the training data to generate rest of the data for the character ${JSON.stringify(trainingData)},
                    `
                  },
                ]
              }
            ]
          })
        });

        if (!characterGenResponse.ok) {
          throw new Error('Failed to generate character profile');

        }

        const characterData = await characterGenResponse.json();

        useConversationStore.getState().addMessage({
          role: 'assistant',
          content: characterData.content,
        });

        console.log('characterData', characterData)


        // Now send the character data to the backend
        // const backendResponse = await fetch('https://zynapse.zkagi.ai/generate-character', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'api-key': 'zk-123321'
        //     },
        //     body: JSON.stringify({
        //         ticker: selectedTicker,
        //         tickerInfo: currentTickerInfo,
        //         userData: {
        //             email: formData.email,
        //             username: formData.username,
        //             password: formData.password
        //         },
        //         characterProfile: characterData.content
        //     })
        // });

        // if (!backendResponse.ok) {
        //     throw new Error('Failed to save character data');
        // }

        //     setSuccess(true);
        // }

        // Extract JSON content from the response
        const contentString = characterData.content;
        const jsonMatch = contentString.match(/```json\n([\s\S]*?)\n```/);
        let characterJson = null;

        // if (jsonMatch && jsonMatch[1]) {
        //   characterJson = JSON.parse(jsonMatch[1]);
        //   characterJson.clients = ["TWITTER"]
        //   // Update the secrets with form data
        //   characterJson.settings.secrets = {
        //     TWITTER_USERNAME: formData.username,
        //     TWITTER_PASSWORD: formData.password,
        //     TWITTER_EMAIL: formData.email
        //   };
        if (jsonMatch && jsonMatch[1]) {
          const parsedJson = JSON.parse(jsonMatch[1]);
          parsedJson.clients = ["twitter"];
          parsedJson.modelProvider = "zkagi";
          parsedJson.plugins = [];
          parsedJson.settings.voice.model = "en_US-hfc_male-medium";
          parsedJson.settings.secrets = {
            TWITTER_USERNAME: formData.username,
            TWITTER_PASSWORD: formData.password,
            TWITTER_EMAIL: formData.email,
            TWITTER_2FA: formData.twofa,
          };
          setCharacterJson(parsedJson);
        } else {
          throw new Error('Failed to parse character JSON from response');
        }

        // // Make the call to save character data
        // const saveResponse = await fetch('https://zynapse.zkagi.ai/characters', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'api-key': 'zk-123321'
        //   },
        //   body: JSON.stringify({
        //     wallet_address: publicKey, // You might want to get this from somewhere
        //     ticker: selectedTicker,
        //     characteristics: characterJson
        //   })
        // });

        // if (!saveResponse.ok) {
        //   throw new Error('Failed to save character data');
        // }

        // setSuccess(true);
      }
    } catch (err) {
      setError('Failed to generate character. Please try again.');
      setLoading(false);
      console.error('Character generation error:', err);
    }
  };

  // const handleConfirmCharacter = async (finalJson: any) => {
  //   try {
  //     // Make the call to save character data
  //     const saveResponse = await fetch('https://zynapse.zkagi.ai/characters', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'api-key': 'zk-123321'
  //       },
  //       body: JSON.stringify({
  //         wallet_address: publicKey,
  //         ticker: selectedTicker,
  //         characteristics: finalJson
  //       })
  //     });

  //     if (!saveResponse.ok) {
  //       throw new Error('Failed to save character data');
  //     }

  //     setSuccess(true);
  //     setCharacterJson(null); // Reset character JSON state
  //   } catch (err) {
  //     setError('Failed to save character. Please try again.');
  //     console.error('Character save error:', err);
  //   }
  // };
  const handleConfirmCharacter = async (finalJson: any) => {
    try {
      const saveResponse = await fetch('https://zynapse.zkagi.ai/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'zk-123321'
        },
        body: JSON.stringify({
          wallet_address: publicKey,
          ticker: selectedTicker,
          characteristics: finalJson
        })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save character data');
      }

      // Reset form data and set success
      setFormData({
        email: '',
        password: '',
        username: ''
      });
      setSuccess(true);
      setCharacterJson(null);
    } catch (err) {
      setError('Failed to save character. Please try again.');
      console.error('Character save error:', err);
    }
  };

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    // <Card className="w-full max-w-md bg-[#171D3D] text-white">
    //   <CardHeader>
    //     <CardTitle className="text-xl font-bold">
    //       Character Generation Setup
    //       {selectedTicker && (
    //         <span className="block text-sm text-gray-400 mt-2">
    //           Selected Ticker: {selectedTicker}
    //         </span>
    //       )}
    //     </CardTitle>
    //   </CardHeader>
    //   <CardContent>
    //     {error && (
    //       <Alert variant="destructive" className="mb-4">
    //         <AlertTitle>Error</AlertTitle>
    //         <AlertDescription>{error}</AlertDescription>
    //       </Alert>
    //     )}
    //     {success ? (
    //       <Alert className="mb-4 bg-green-600">
    //         <AlertTitle>Success!</AlertTitle>
    //         <AlertDescription>
    //           Character generation process has started for {selectedTicker}
    //         </AlertDescription>
    //       </Alert>
    //     ) : (
    //       <form onSubmit={handleSubmit} className="space-y-4">
    //         <div>
    //           <label className="block mb-2">Twitter Email</label>
    //           <Input
    //             type="email"
    //             name="email"
    //             value={formData.email}
    //             onChange={handleChange}
    //             className="w-full bg-[#24284E] border-[#BDA0FF]"
    //             placeholder="Enter your email"
    //           />
    //         </div>
    //         <div>
    //           <label className="block mb-2">Twitter Username</label>
    //           <Input
    //             type="text"
    //             name="username"
    //             value={formData.username}
    //             onChange={handleChange}
    //             className="w-full bg-[#24284E] border-[#BDA0FF]"
    //             placeholder="Choose a username"
    //           />
    //         </div>
    //         <div>
    //           <label className="block mb-2">Twitter Password</label>
    //           <Input
    //             type="password"
    //             name="password"
    //             value={formData.password}
    //             onChange={handleChange}
    //             className="w-full bg-[#24284E] border-[#BDA0FF]"
    //             placeholder="Enter your password"
    //           />
    //         </div>
    //         <Button
    //           type="submit"
    //           className="w-full bg-gradient-to-r from-[#BDA0FF] to-[#6D47FF]"
    //           disabled={!selectedTicker}
    //         >
    //           Generate Character
    //         </Button>
    //       </form>
    //     )}
    //     {characterJson && (
    //       <div className="mt-4">
    //         <CharecterJsonEditor
    //           initialJson={characterJson}
    //           onConfirm={handleConfirmCharacter}
    //           onCancel={() => setCharacterJson(null)}
    //         />
    //       </div>
    //     )}
    //   </CardContent>
    // </Card>
    <Card className="w-full max-w-md bg-[#171D3D] text-white border">
      <div className="flex justify-end">
        <Tooltip content={
          <>
            <p>Ensure in your Twitter account that Twitter 2-Factor Auth checkboxes are unchecked.</p>
            <br />
            <p>If you have a Google/Social sign-in, disable it. Use email and password to login.</p>
          </>
        }>
          <Button variant="ghost" className="p-2">
            <InfoIcon className="size-5 text-gray-400" />
          </Button>
        </Tooltip>
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Character Generation Setup
          {selectedTicker && (
            <span className="block text-sm text-gray-400 mt-2">
              Selected Ticker: {selectedTicker}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Alert className="mb-4 bg-green-600">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Character for {selectedTicker} has been successfully generated and saved.
            </AlertDescription>
          </Alert>
        ) : characterJson ? (
          <>
            <Button onClick={() => setEditMode(true)}>
              Edit Mode On
            </Button>
            <CharecterJsonEditor
              initialJson={characterJson}
              onConfirm={handleConfirmCharacter}
              onCancel={() => setCharacterJson(null)}
            />
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Twitter Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#24284E] border-[#BDA0FF]"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block mb-2">Twitter Username</label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-[#24284E] border-[#BDA0FF]"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label className="block mb-2">Twitter Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#24284E] border-[#BDA0FF]"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label className="block mb-2">Twitter 2FA Secret </label>
              <Input
                type="twofa"
                name="twofa"
                value={formData.twofa}
                onChange={handleChange}
                className="w-full bg-[#24284E] border-[#BDA0FF]"
                placeholder="Enter your password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#BDA0FF] to-[#6D47FF]"
              disabled={!selectedTicker}
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                'Generate Character'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterGenForm;