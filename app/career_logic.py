def recommend_careers(exam: str, percentile: float):
    careers = []

    if exam == "MHT-CET":
        if percentile >= 95:
            careers = [
                "Software Engineer",
                "AI / ML Engineer",
                "Data Scientist",
                "Cyber Security Engineer"
            ]
        elif percentile >= 85:
            careers = [
                "IT Engineer",
                "Computer Engineer",
                "Electronics Engineer"
            ]
        elif percentile >= 70:
            careers = [
                "Applied IT",
                "Automation Engineer",
                "Technical Analyst"
            ]
        else:
            careers = [
                "Diploma Engineering",
                "Skill-based IT Roles",
                "Polytechnic Path"
            ]

    elif exam == "JEE":
        if percentile >= 98:
            careers = [
                "Core Software Engineer",
                "Research Engineer",
                "AI Engineer"
            ]
        elif percentile >= 90:
            careers = [
                "IT Engineer",
                "Electronics Engineer"
            ]
        else:
            careers = [
                "Private Engineering Colleges",
                "Skill-based Technical Roles"
            ]

    return careers


def build_guidance_prompt(student_type: str, answers: dict) -> str:
    return f"""
You are an expert career counselor.

Student type: {student_type}

Student answers:
{answers}

Tasks:
1. Analyze interests and background
2. Estimate chances of success
3. Suggest suitable domains
4. Provide a clear step-by-step roadmap

Respond in simple, structured text.
"""
