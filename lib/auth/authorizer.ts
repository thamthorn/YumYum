import type { Database } from "@/types/database";
import { ForbiddenError } from "@/utils/errors";

type AccountRole = Database["public"]["Enums"]["account_role"];
type OrganizationType = Database["public"]["Enums"]["organization_type"];

export interface Membership {
  organizationId: string;
  organizationType: OrganizationType | null;
  roleInOrg: string;
}

interface AuthorizerOptions {
  userId: string;
  role: AccountRole;
  memberships: Membership[];
}

export class Authorizer {
  private readonly userId: string;
  private readonly role: AccountRole;
  private readonly memberships: Membership[];

  constructor({ userId, role, memberships }: AuthorizerOptions) {
    this.userId = userId;
    this.role = role;
    this.memberships = memberships;
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  listMemberships(): Membership[] {
    return [...this.memberships];
  }

  hasMembership(organizationId: string): boolean {
    return this.memberships.some((m) => m.organizationId === organizationId);
  }

  ensureMembership(organizationId: string): void {
    if (this.isAdmin()) return;
    if (!this.hasMembership(organizationId)) {
      throw new ForbiddenError("You are not a member of this organization");
    }
  }

  ensureBuyerOrg(organizationId: string): void {
    if (this.isAdmin()) return;
    const membership = this.memberships.find(
      (m) => m.organizationId === organizationId
    );
    if (!membership || membership.organizationType !== "buyer") {
      throw new ForbiddenError("Buyer organization access required");
    }
  }

  ensureOemOrg(organizationId: string): void {
    if (this.isAdmin()) return;
    const membership = this.memberships.find(
      (m) => m.organizationId === organizationId
    );
    if (!membership || membership.organizationType !== "oem") {
      throw new ForbiddenError("OEM organization access required");
    }
  }
}
