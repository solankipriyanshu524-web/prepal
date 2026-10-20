// Dynamic Human Tech Lead Interview Engine & Comprehensive Evaluation Suite

const HUMAN_INTERVIEWER_PROMPT = (role, level, currentPhase = 'Introduction', timeRemaining = '45:00', currentCode = '') => `
You are Alex, an authentic Staff Software Engineer & Hiring Bar Raiser at a tier-1 tech firm (Google/Meta standard) conducting a live interview for a ${level} ${role}.
Time Remaining: ${timeRemaining}
Current Round Stage: ${currentPhase}

The candidate's current code in the Monaco Editor:
\`\`\`
${currentCode || '// (Editor is currently blank / skeleton)'}
\`\`\`

CRITICAL INTERVIEWER DIRECTIVES:
1. EXTREME BREVITY (2 TO 3 SENTENCES ONLY):
   - This is an active voice interview. DO NOT write essays, long paragraphs, or monologues.
   - Limit your response to 2 to 3 concise, conversational sentences maximum.

2. GROUNDED IN CODE & REALITY (STRICT NO-HALLUCINATION POLICY):
   - Always acknowledge and base your reply on the candidate's actual code in the editor above.
   - If they wrote a loop (e.g. \`while left < right:\`), ask what logic or pointer movement they will put inside the loop.
   - NEVER hallucinate concepts the user didn't mention (e.g. "floating point numbers", "O.O notation"). Treat speech-to-text slips naturally without creating theories.

3. NEVER GIVE PREMATURE PRAISE OR FINAL EVALUATIONS:
   - Do NOT say "We've got a good candidate for this problem" or give grades midway through the interview.
   - Stay sharp, encouraging, and collaborative: "Good start," "Walk me through that logic," "What edge case could break this?"

4. STAGE-AWARE PROBING:
   - Clarify: Ensure they understand constraints (sorted array, 1-indexed, O(1) space).
   - Approach: Ask for time/space complexity before coding.
   - Implementation: Guide their code structure and verify pointer boundaries.
 `;

// Detect code patterns, potential hazards, and complexity issues for proactive interjections
export function detectCodeAnomalies(code = '', language = 'javascript', starterCode = '') {
  if (!code || code.trim() === (starterCode || '').trim()) return null;

  const normalized = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''); // strip comments

  // 1. Nested loop detection
  if (language === 'javascript') {
    const hasNestedFor = /for\s*\([^)]*\)\s*\{[\s\S]*?for\s*\(/.test(normalized);
    const hasNestedWhile = /while\s*\([^)]*\)\s*\{[\s\S]*?while\s*\(/.test(normalized);
    const hasForWhile = /for\s*\([^)]*\)\s*\{[\s\S]*?while\s*\(/.test(normalized) || /while\s*\([^)]*\)\s*\{[\s\S]*?for\s*\(/.test(normalized);
    const hasMethodInsideLoop = /(?:for|while)\s*\([^)]*\)\s*\{[\s\S]*?\.(?:indexOf|includes|filter|find)\s*\(/.test(normalized);

    if (hasNestedFor || hasNestedWhile || hasForWhile || hasMethodInsideLoop) {
      return {
        type: 'nested_loop',
        title: 'Nested Loop / O(N²) Warning',
        preview: 'Multiple nested loops or array lookups detected within iteration',
        defaultHint: "I notice you're introducing a nested loop structure here. Before we proceed further, what do you estimate the time complexity will be as N grows?"
      };
    }
  } else {
    // Python nested loop detection (indentation or keywords)
    const pyLines = normalized.split('\n');
    let loopIndents = [];
    for (const line of pyLines) {
      const match = line.match(/^(\s*)(for|while)\s+/);
      if (match) {
        const indent = match[1].length;
        if (loopIndents.some(i => indent > i)) {
          return {
            type: 'nested_loop',
            title: 'Nested Loop / O(N²) Warning',
            preview: 'Nested for/while loops detected in Python code',
            defaultHint: "I notice a nested loop pattern in your Python code. Before diving deeper, how do you expect this to scale in terms of Big-O time complexity?"
          };
        }
        loopIndents.push(indent);
      }
    }
  }

  // 2. Infinite Loop Hazard in while loop
  const hasWhileCondition = /(?:while\s*\(\s*left\s*<\s*right\s*\)|while\s+left\s*<\s*right\s*:)/.test(normalized);
  if (hasWhileCondition) {
    const hasPointerUpdate = /(?:left\s*\+\+|left\s*\+=|left\s*=\s*left\s*\+|right\s*--|right\s*-=|right\s*=\s*right\s*-)/.test(normalized);
    const lines = normalized.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 6 && !hasPointerUpdate) {
      return {
        type: 'infinite_loop',
        title: 'Infinite Loop Risk: Missing Pointer Advance',
        preview: 'While loop does not modify pointer bounds (left / right)',
        defaultHint: "Quick heads-up on your while loop: make sure your pointer updates (like left++ or right--) are in place so you avoid an infinite loop when running the sandbox."
      };
    }
  }

  // 3. Hardcoded Return values (e.g. return [1, 2] instead of pointers)
  const hasHardcodedReturn = /return\s*\[\s*1\s*,\s*2\s*\]/i.test(normalized) || /return\s*\[\s*0\s*,\s*1\s*\]/i.test(normalized);
  const hasPointers = /(?:left|right)/.test(normalized);
  if (hasHardcodedReturn && hasPointers) {
    return {
      type: 'hardcoded_return',
      title: 'Static Return Detected',
      preview: 'Hardcoded index return detected instead of dynamic pointer values',
      defaultHint: "I noticed a static return like [1, 2]. Remember the problem requires dynamically calculated 1-based indices from your pointer search!"
    };
  }

  return null;
}

// Proactive Over-the-Shoulder Nudge Generator
export async function getProactiveInterviewerNudge({
  triggerType = 'inactivity',
  code = '',
  language = 'javascript',
  problem,
  role = 'Full-Stack Engineer',
  level = 'Mid-Level',
  timeRemaining = '45:00',
  provider = 'demo',
  apiKey = '',
  ollamaModel = 'llama3.2',
  ollamaUrl = 'http://localhost:11434'
}) {
  const fallbackResponses = {
    inactivity: [
      "I notice you've paused for a minute—are you visualizing the pointer convergence, or would it help to walk through an example array together?",
      "Take your time thinking through the data structures. When you're ready, feel free to share your thought process or bounce an idea off me!",
      "I'm keeping an eye on your editor. Are you leaning towards a Two-Pointer technique or a Hash Map approach for this problem?"
    ],
    nested_loop: [
      "I notice you're introducing a nested loop structure here. Before we proceed further, what do you estimate the time complexity will be as N grows?",
      "Take a look at that inner loop—could this inadvertently lead us to an O(N²) quadratic runtime? How might we achieve this in a single pass?"
    ],
    infinite_loop: [
      "Quick heads-up on your while loop: make sure your pointer updates (like left++ or right--) are in place so you avoid an infinite loop when executing.",
      "Just observing your loop bounds: make sure both pointers have a clear condition to advance so the loop terminates gracefully."
    ],
    hardcoded_return: [
      "I see a hardcoded return statement like [1, 2]. Make sure your return values are calculated dynamically from your pointer positions!",
      "Remember the problem expects 1-indexed results derived from the active search logic rather than fixed values."
    ],
    faang_curveball: [
      "Great progress on the core logic! Let's elevate this: what if the input stream was 100 gigabytes on disk and couldn't fit in memory—how would you adapt this approach?",
      "Nice work so far! Here's a live follow-up from our team: what if the input array had millions of duplicate target pairs? How would you handle that efficiently?"
    ]
  };

  const list = fallbackResponses[triggerType] || fallbackResponses.inactivity;
  const cannedReply = list[Math.floor(Math.random() * list.length)];

  if (provider === 'demo' || (!apiKey && provider !== 'ollama')) {
    await new Promise(r => setTimeout(r, 450));
    return cannedReply;
  }

  const prompt = `You are Alex, a Staff Engineer and Tech Lead at Google/Meta conducting a live technical interview.
You are observing the candidate code live over their shoulder in the Monaco Editor.
Trigger Event: ${triggerType}.
Candidate's code:
\`\`\`${language}
${code || '// (Editor is empty)'}
\`\`\`
Task: Provide a single short, natural, conversational 1-to-2 sentence observation or Socratic question (MAX 30 words).
Do NOT provide code solutions or full answers. Be encouraging, sharp, and authentic.`;

  try {
    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 75, temperature: 0.6 }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text.replace(/^"|"$/g, '');
      }
    } else if (provider === 'ollama') {
      const targetUrl = ollamaUrl.endsWith('/') ? `${ollamaUrl}api/chat` : `${ollamaUrl}/api/chat`;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel || 'llama3.2',
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          options: { temperature: 0.5, num_predict: 60 }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.message?.content?.trim();
        if (text) return text.replace(/^"|"$/g, '');
      }
    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 60,
          temperature: 0.5
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text.replace(/^"|"$/g, '');
      }
    }
  } catch (err) {
    console.warn('Proactive LLM observation fallback:', err);
  }

  return cannedReply;
}

export async function askInterviewer({
  provider = 'demo',
  apiKey = '',
  messages = [],
  currentCode = '',
  problem,
  role = 'Full-Stack Engineer',
  level = 'Mid-Level',
  phase = 'clarify',
  timeRemaining = '45:00',
  ollamaModel = 'llama3.2',
  ollamaUrl = 'http://localhost:11434'
}) {
  const systemInstruction = HUMAN_INTERVIEWER_PROMPT(role, level, phase, timeRemaining, currentCode);

  // 1. DEMO MODE (Intelligent Dynamic Human Interviewer Simulator)
  if (provider === 'demo' || (!apiKey && provider !== 'ollama')) {
    await new Promise(r => setTimeout(r, 650));

    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserText = userMessages[userMessages.length - 1]?.text?.toLowerCase() || '';

    // Candidate greets / says ready
    if (userMessages.length === 1 && (lastUserText.includes('hi') || lastUserText.includes('hello') || lastUserText.includes('ready') || lastUserText.includes('yes'))) {
      return `Awesome! Let's jump right in. Today I want to explore how you handle sorted datasets and memory optimization. Suppose we have an array of integers that is already sorted, and we want to find two numbers that sum up to a specific target value. Take a look at the editor on your right—how would you initially approach this problem before writing code?`;
    }

    // Direct Question: "what to do here" / "what is the question"
    if (lastUserText.includes('what') && (lastUserText.includes('do') || lastUserText.includes('problem') || lastUserText.includes('task') || lastUserText.includes('here'))) {
      return `Sure, let me clarify the scenario! Imagine you have an array like [2, 7, 11, 15] and a target sum of 9. Your objective is to find the two numbers that add up to 9 and return their 1-based indices, which here would be [1, 2]. You can assume a solution exists and you cannot reuse the same element. What initial strategy comes to mind?`;
    }

    // Direct Question: "why two pointers"
    if (lastUserText.includes('why') && (lastUserText.includes('pointer') || lastUserText.includes('two') || lastUserText.includes('2'))) {
      return `Great question! We use Two Pointers because the array is already sorted. If we put one pointer at the start and one at the end, any sum that is too large guarantees that moving the right pointer inward will decrease the sum. That brings our time complexity down from O(n²) to a clean O(n) without using extra memory. Does that intuition make sense to you?`;
    }

    // Candidate asks for hint or is stuck
    if (lastUserText.includes('hint') || lastUserText.includes('stuck') || lastUserText.includes('help') || lastUserText.includes('kaise')) {
      return `Here's a thought experiment: If you check numbers[left] + numbers[right] and the sum is smaller than our target, which pointer must move forward to give you a larger sum? Try testing that with [2, 7, 11, 15] and target = 9.`;
    }

    // Candidate asks to review their code
    if (lastUserText.includes('check') || lastUserText.includes('review') || lastUserText.includes('my code') || lastUserText.includes('i wrote') || lastUserText.includes('done')) {
      const hasWhile = currentCode.includes('while');
      const hasPointers = currentCode.includes('left') && currentCode.includes('right');

      if (hasWhile && hasPointers) {
        return `I took a look at your implementation in the editor! Your two-pointer bounds and while loop condition look solid. Click 'Run Sandbox' to execute it against test cases. What edge case could potentially trip this up?`;
      } else {
        return `I'm observing your editor. You have the function signature, but the two-pointer loop logic is still empty. Go ahead and start writing your while loop with left and right indices!`;
      }
    }

    // Candidate asks AI to generate code
    if (lastUserText.includes('generate') || lastUserText.includes('show code') || lastUserText.includes('solution code') || lastUserText.includes('give me code')) {
      return `Here is how we would structure an optimal O(n) time, O(1) space two-pointer solution:

\`\`\`javascript
function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    else if (sum < target) left++;
    else right--;
  }
  return [];
}
\`\`\`
Notice how the pointers converge in a single pass. How would you explain this line-by-line in an interview?`;
    }

    // OOPs / System Design topic triggers
    if (lastUserText.includes('oop') || lastUserText.includes('class') || lastUserText.includes('design') || phase === 'deep_dive') {
      if (lastUserText.includes('oop') || lastUserText.includes('class')) {
        return `Let's pivot to OOPs: In our production service, we wouldn't just have a standalone script. How would you encapsulate this in a clean, reusable class? What methods and member variables would you expose to other microservices?`;
      }
      return `Now let's step up to a System Architecture question that top tech firms love: What if this sorted dataset is 100GB on disk and cannot fit into RAM? How would you architect this using external chunking or distributed worker nodes to still run a two-pointer search?`;
    }

    // Complexity discussion
    if (lastUserText.includes('time') || lastUserText.includes('space') || lastUserText.includes('complexity') || lastUserText.includes('o(n)')) {
      return `Spot on. Because each pointer only advances in one direction, each element is visited at most once, giving us O(n) time. And since we only maintain two integer pointers, auxiliary space is strictly O(1). How would you test this for boundary cases like an array of just 2 elements?`;
    }

    // Natural follow-ups
    const naturalHumanFollowUps = [
      `That's a very logical direction. Walk me through what happens when numbers[left] + numbers[right] equals the target. What does the problem expect us to return?`,
      `Good observation! Notice that the problem asks for 1-indexed positions rather than 0-indexed. Did you account for [left + 1, right + 1] in your return statement?`,
      `I like how you're reasoning through this. Would you like to run the code in the Monaco Sandbox to verify if [2, 7, 11, 15] returns [1, 2]?`,
      `Nice explanation. How would you test this function in a CI/CD pipeline? What unit test cases would you write first?`
    ];

    return naturalHumanFollowUps[Math.floor(Math.random() * naturalHumanFollowUps.length)];
  }

  // 2. GOOGLE GEMINI 1.5 FLASH (Real LLM)
  if (provider === 'gemini') {
    try {
      const contents = [
        {
          role: 'user',
          parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemInstruction}` }]
        },
        ...messages.map((m, idx) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ 
            text: (idx === messages.length - 1 && m.role === 'user' && currentCode)
              ? `${m.text}\n\n[Candidate's Current Editor Code]:\n${currentCode}`
              : m.text 
          }]
        }))
      ];

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 140,
            temperature: 0.6
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || `Gemini status ${res.status}`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could you walk me through your thought process on that?';
    } catch (err) {
      console.warn('Gemini call failed, switching to smart interviewer fallback:', err);
      // Seamless smart fallback
      return askInterviewer({
        provider: 'demo',
        messages,
        currentCode,
        problem,
        role,
        level,
        phase,
        timeRemaining
      });
    }
  }

  // 3. OLLAMA (LOCAL LLaMA 3.2)
  if (provider === 'ollama') {
    try {
      const ollamaMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.map((m, idx) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: (idx === messages.length - 1 && m.role === 'user' && currentCode)
            ? `${m.text}\n\n[Candidate's Current Editor Code]:\n${currentCode}`
            : m.text
        }))
      ];

      const targetUrl = ollamaUrl.endsWith('/') ? `${ollamaUrl}api/chat` : `${ollamaUrl}/api/chat`;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel || 'llama3.2',
          messages: ollamaMessages,
          stream: false,
          options: {
            temperature: 0.4,
            top_p: 0.9,
            num_predict: 110,
            stop: ["Candidate:", "User:"]
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Ollama connection error at ${ollamaUrl}`);
      }

      const data = await res.json();
      return data.message?.content || 'That sounds interesting, tell me more about your design.';
    } catch (err) {
      console.warn('Ollama call failed, switching to smart interviewer fallback:', err);
      return askInterviewer({
        provider: 'demo',
        messages,
        currentCode,
        problem,
        role,
        level,
        phase,
        timeRemaining
      });
    }
  }

  // 4. OPENAI (GPT-4o-mini)
  if (provider === 'openai') {
    try {
      const openAiMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.text
        }))
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: openAiMessages,
          max_tokens: 250,
          temperature: 0.7
        })
      });

      if (!res.ok) {
        throw new Error('OpenAI API connection failed');
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'Could you elaborate on your solution?';
    } catch (err) {
      console.warn('OpenAI error, fallback to smart interviewer:', err);
      return askInterviewer({
        provider: 'demo',
        messages,
        currentCode,
        problem,
        role,
        level,
        phase,
        timeRemaining
      });
    }
  }

  return 'Could you walk me through your solution step by step?';
}

// Comprehensive Post-Interview Evaluation & Scorecard (Generated ONLY at the end)
export async function generateInterviewScorecard({
  provider = 'demo',
  apiKey = '',
  messages = [],
  currentCode = '',
  problem,
  role = 'Full-Stack Engineer',
  level = 'Mid-Level'
}) {
  const userMessages = messages.filter(m => m.role === 'user');
  const userMessageCount = userMessages.length;
  const totalWordsSpoken = userMessages.reduce((acc, m) => acc + (m.text?.split(/\s+/).length || 0), 0);

  // CASE 1: Candidate did NOT do anything (0 messages sent)
  if (userMessageCount === 0) {
    return {
      overallScore: 1.5,
      verdict: 'Incomplete / No Submission',
      technicalAccuracy: 10,
      codeQuality: 10,
      problemSolving: 5,
      communication: 0,
      timeComplexity: 'N/A (No approach provided)',
      spaceComplexity: 'N/A (No approach provided)',
      keyStrengths: [
        'Joined the interview session and accessed the coding environment'
      ],
      keyWeaknesses: [
        'Candidate did not respond to any questions or interact with the interviewer',
        'No algorithmic explanation or code implementation was submitted',
        'Failed to discuss time or space complexity'
      ],
      detailedFeedback: 'The interview ended without candidate participation. In a real technical interview, you must communicate your thoughts out loud, clarify constraints, and walk through your approach before coding.'
    };
  }

  // CASE 2: Minimal participation (1 or 2 short questions without solving)
  if (userMessageCount <= 2 && totalWordsSpoken < 25) {
    return {
      overallScore: 3.5,
      verdict: 'Needs Improvement',
      technicalAccuracy: 32,
      codeQuality: 35,
      problemSolving: 30,
      communication: 40,
      timeComplexity: 'Undetermined (Incomplete explanation)',
      spaceComplexity: 'Undetermined (Incomplete explanation)',
      keyStrengths: [
        'Initiated initial contact with the interviewer'
      ],
      keyWeaknesses: [
        'Did not complete the problem or explain algorithmic logic',
        'Did not verify code in the sandbox or handle edge cases',
        'Session ended before sufficient technical depth could be evaluated'
      ],
      detailedFeedback: `Candidate initiated conversation for "${problem.title}", but the interview concluded prematurely. More comprehensive explanation of data structures and execution in the sandbox is required for a passing grade.`
    };
  }

  // CASE 3: Gemini Real Evaluation
  if (provider === 'gemini' && apiKey) {
    try {
      const evaluationPrompt = `
You are a Staff Technical Interviewer evaluating a candidate's completed mock interview for a ${level} ${role}.
Problem: ${problem.title}
Candidate Final Code in Editor:
\`\`\`
${currentCode}
\`\`\`

Interview Transcript:
${messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}

Produce a thorough, fair evaluation. Return ONLY a valid JSON object matching this exact schema (no markdown, no backticks, just raw JSON):
{
  "overallScore": 8.5,
  "verdict": "Strong Hire",
  "technicalAccuracy": 88,
  "codeQuality": 85,
  "problemSolving": 87,
  "communication": 90,
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "keyWeaknesses": ["Area 1", "Area 2"],
  "detailedFeedback": "Comprehensive summary paragraph analyzing candidate strengths, architecture decisions, and growth areas."
}
`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          return JSON.parse(jsonText);
        }
      }
    } catch (e) {
      console.warn('Gemini evaluation fallback to strict rubric:', e);
    }
  }

  // CASE 4: Active candidate participation deterministic evaluation
  const hasComplexityDiscussed = userMessages.some(m => m.text.toLowerCase().includes('o(') || m.text.toLowerCase().includes('time') || m.text.toLowerCase().includes('space'));
  const hasPointersDiscussed = userMessages.some(m => m.text.toLowerCase().includes('pointer') || m.text.toLowerCase().includes('sort') || m.text.toLowerCase().includes('sum'));

  let accuracy = 60 + (hasPointersDiscussed ? 20 : 0) + (userMessageCount > 3 ? 10 : 0);
  let codeScore = 65 + (hasComplexityDiscussed ? 15 : 0) + (totalWordsSpoken > 50 ? 10 : 0);
  let problemScore = 55 + (userMessageCount * 7);
  let commScore = Math.min(95, 50 + totalWordsSpoken);

  accuracy = Math.min(95, accuracy);
  codeScore = Math.min(92, codeScore);
  problemScore = Math.min(94, problemScore);
  commScore = Math.min(95, commScore);

  const overallScore = parseFloat(((accuracy * 0.35 + codeScore * 0.25 + problemScore * 0.25 + commScore * 0.15) / 10).toFixed(1));
  const verdict = overallScore >= 8.2 ? 'Strong Hire' : overallScore >= 6.8 ? 'Hire' : 'Needs Improvement';

  return {
    overallScore,
    verdict,
    technicalAccuracy: accuracy,
    codeQuality: codeScore,
    problemSolving: problemScore,
    communication: commScore,
    timeComplexity: hasComplexityDiscussed ? 'O(n) - Linear scan' : 'O(n) Estimated',
    spaceComplexity: 'O(1) - Constant auxiliary space',
    keyStrengths: [
      'Engaged with the interviewer to clarify algorithmic intuition',
      hasComplexityDiscussed ? 'Correctly identified O(n) time and O(1) space constraints' : 'Demonstrated good reasoning through the problem requirements'
    ],
    keyWeaknesses: [
      'Could proactively discuss boundary edge cases (e.g. empty or 2-element inputs)',
      'Ensure unit assertions are run in the sandbox prior to completion'
    ],
    detailedFeedback: `Candidate demonstrated solid reasoning for ${role} level expectations on "${problem.title}". Maintained good communication and answered follow-up inquiries.`
  };
}
