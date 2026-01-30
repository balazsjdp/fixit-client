const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function createReport(formData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create report");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
}
