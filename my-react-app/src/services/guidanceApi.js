export async function analyzeGuidance(studentType, answers) {
  const response = await fetch("http://127.0.0.1:8000/guidance/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      student_type: studentType,
      answers: answers
    })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch guidance");
  }

  return await response.json();
}
