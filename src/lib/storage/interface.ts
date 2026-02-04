/**
 * Universal storage adapter interface.
 *
 * All data access goes through this interface so that the app can
 * swap between Supabase (cloud) and SQLite (desktop) without
 * changing any UI or business-logic code.
 */

import type { Artifact, ArtifactLink, Project } from '@/types'

export interface StorageAdapter {
  // --- Projects ---
  getProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project | null>
  createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project>
  updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project>
  deleteProject(id: string): Promise<void>

  // --- Artifacts ---
  getArtifacts(projectId: string, type?: string): Promise<Artifact[]>
  getArtifact(id: string): Promise<Artifact | null>
  saveArtifact(artifact: Artifact): Promise<void>
  deleteArtifact(id: string): Promise<void>

  // --- Links ---
  getLinks(projectId: string): Promise<ArtifactLink[]>
  saveLink(link: ArtifactLink): Promise<void>
  deleteLink(id: string): Promise<void>
}
