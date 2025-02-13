import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuizContent, AssignmentContent, DiscussionContent, ProjectContent } from "@/types/curriculum";

interface FormProps<T> {
	content: T;
	onChange: (content: T) => void;
}

export const QuizForm: React.FC<FormProps<QuizContent>> = ({ content, onChange }) => {
	const addQuestion = () => {
		onChange({
			questions: [
				...content.questions,
				{ question: "", options: [], correctAnswer: "" }
			]
		});
	};

	const updateQuestion = (index: number, question: string) => {
		const newQuestions = [...content.questions];
		newQuestions[index] = { ...newQuestions[index], question };
		onChange({ questions: newQuestions });
	};

	return (
		<div className="space-y-4">
			{content.questions.map((q, i) => (
				<div key={i} className="space-y-2">
					<Input
						value={q.question}
						onChange={(e) => updateQuestion(i, e.target.value)}
						placeholder="Question text"
					/>
				</div>
			))}
			<Button type="button" variant="outline" onClick={addQuestion}>
				Add Question
			</Button>
		</div>
	);
};

export const AssignmentForm: React.FC<FormProps<AssignmentContent>> = ({ content, onChange }) => {
	return (
		<div className="space-y-4">
			<Textarea
				value={content.instructions || ""}
				onChange={(e) => onChange({ ...content, instructions: e.target.value })}
				placeholder="Assignment instructions"
				rows={4}
			/>
			<Input
				type="number"
				value={content.totalPoints || ""}
				onChange={(e) => onChange({ ...content, totalPoints: Number(e.target.value) })}
				placeholder="Total points"
			/>
		</div>
	);
};

export const DiscussionForm: React.FC<FormProps<DiscussionContent>> = ({ content, onChange }) => {
	const addGuideline = () => {
		onChange({
			...content,
			guidelines: [...(content.guidelines || []), ""]
		});
	};

	const updateGuideline = (index: number, value: string) => {
		const newGuidelines = [...(content.guidelines || [])];
		newGuidelines[index] = value;
		onChange({ ...content, guidelines: newGuidelines });
	};

	return (
		<div className="space-y-4">
			<Input
				value={content.topic || ""}
				onChange={(e) => onChange({ ...content, topic: e.target.value })}
				placeholder="Discussion topic"
			/>
			<div className="space-y-2">
				{content.guidelines?.map((guideline, i) => (
					<Input
						key={i}
						value={guideline}
						onChange={(e) => updateGuideline(i, e.target.value)}
						placeholder={`Guideline ${i + 1}`}
					/>
				))}
			</div>
			<Button type="button" variant="outline" onClick={addGuideline}>
				Add Guideline
			</Button>
		</div>
	);
};

export const ProjectForm: React.FC<FormProps<ProjectContent>> = ({ content, onChange }) => {
	const addObjective = () => {
		onChange({
			...content,
			objectives: [...(content.objectives || []), ""]
		});
	};

	const updateObjective = (index: number, value: string) => {
		const newObjectives = [...(content.objectives || [])];
		newObjectives[index] = value;
		onChange({ ...content, objectives: newObjectives });
	};

	return (
		<div className="space-y-4">
			<Textarea
				value={content.description || ""}
				onChange={(e) => onChange({ ...content, description: e.target.value })}
				placeholder="Project description"
				rows={4}
			/>
			<div className="space-y-2">
				{content.objectives?.map((objective, i) => (
					<Input
						key={i}
						value={objective}
						onChange={(e) => updateObjective(i, e.target.value)}
						placeholder={`Objective ${i + 1}`}
					/>
				))}
			</div>
			<Button type="button" variant="outline" onClick={addObjective}>
				Add Objective
			</Button>
		</div>
	);
};