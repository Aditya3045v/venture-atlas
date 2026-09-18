import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { caseStudySchema } from "@/lib/validation";
import { getCurrentUser, canEdit, canPublish } from "@/lib/auth/staff";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser(req);
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: "Unauthorized: Edit privileges required" }, { status: 403 });
  }

  try {
    const json = await req.json();

    const { data: existing, error: findError } = await supabaseAdmin
      .from("case_studies")
      .select("id, author_id, slug, published_at")
      .eq("id", params.id)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    const isOwnerOrSuper = user.email === "admin@ventureatlas.in" || user.role === "SUPER_ADMIN";
    if (!isOwnerOrSuper && user.role === "WRITER") {
      if (existing.author_id !== user.id) {
        return NextResponse.json(
          { error: "PERMISSION_DENIED: Writers can only edit their own case studies." },
          { status: 403 }
        );
      }
    }

    if (!json.seoTitle || !String(json.seoTitle).trim()) {
      json.seoTitle = (json.title || "").slice(0, 68);
    }
    if (!json.seoDescription || !String(json.seoDescription).trim()) {
      json.seoDescription = (json.summary || "").slice(0, 155);
    }

    const validated = caseStudySchema.parse(json);

    const publishedAt = validated.status === "PUBLISHED"
      ? (existing.published_at || new Date().toISOString())
      : null;

    const { data: updated, error } = await supabaseAdmin
      .from("case_studies")
      .update({
        title: validated.title,
        company: validated.company,
        company_logo: json.companyLogo || null,
        valuation: validated.valuation || null,
        stage: validated.stage || null,
        key_metric: validated.keyMetric || null,
        summary: validated.summary,
        challenge: validated.challenge || null,
        strategy: validated.strategy || null,
        outcome: validated.outcome || null,
        body: validated.body,
        cover_image: validated.coverImage || null,
        category_id: validated.categoryId,
        read_time_minutes: validated.readTimeMinutes || 8,
        status: validated.status,
        published_at: publishedAt,
        canvas_data: validated.canvasData || null,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase case study update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: "UPDATE_CASE_STUDY",
      entityType: "CASE_STUDY",
      entityId: params.id,
      actor: user,
      metadata: { company: validated.company, title: validated.title },
    });

    try {
      const { revalidateTag, revalidatePath } = require("next/cache");
      const { submitIndexNow } = require("@/lib/indexnow");
      revalidateTag("case-studies");
      if (updated?.slug) {
        revalidateTag(`case-study:${updated.slug}`);
        revalidatePath(`/case-studies/${updated.slug}`);
        await submitIndexNow(`/case-studies/${updated.slug}`);
      }
      revalidatePath("/case-studies");
      revalidatePath("/");
    } catch { /* ignore */ }

    return NextResponse.json({ caseStudy: updated });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update case study" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser(req);
  if (!user || !canPublish(user.role)) {
    return NextResponse.json({ error: "Unauthorized: Editor or Admin privileges required" }, { status: 403 });
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from("case_studies")
      .select("slug")
      .eq("id", params.id)
      .single();

    const { error } = await supabaseAdmin
      .from("case_studies")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Supabase case study delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: "DELETE_CASE_STUDY",
      entityType: "CASE_STUDY",
      entityId: params.id,
      actor: user,
      metadata: { id: params.id },
    });

    try {
      const { revalidateTag, revalidatePath } = require("next/cache");
      const { submitIndexNow } = require("@/lib/indexnow");
      revalidateTag("case-studies");
      if (existing?.slug) {
        revalidateTag(`case-study:${existing.slug}`);
        revalidatePath(`/case-studies/${existing.slug}`);
        await submitIndexNow(`/case-studies/${existing.slug}`);
      }
      revalidatePath("/case-studies");
      revalidatePath("/");
    } catch { /* ignore */ }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete case study" }, { status: 500 });
  }
}