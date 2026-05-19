'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

interface Crumb {
  label: string;
  href: string | null; // null = current page (no link)
}

export const WorkspaceBreadcrumb: React.FC = () => {
  const pathname = usePathname();
  const params = useParams<{
    slug?: string;
    projectId?: string;
    issueId?: string;
  }>();

  const workspace = useSelector(
    (state: RootState) => state.workspace.currentWorkspace
  );
  const project = useSelector(
    (state: RootState) => state.project.currentProject
  );

  const { slug, projectId, issueId } = params ?? {};

  // Build the crumb trail from the pathname segments
  const crumbs: Crumb[] = [{ label: 'workspaces', href: '/workspaces' }];

  if (!slug) return null;

  // Workspace crumb — show name if loaded, otherwise slug
  const workspaceLabel = workspace?.name ?? slug;
  const workspaceHref = `/workspaces/${slug}`;
  const atWorkspaceRoot = pathname === workspaceHref;
  crumbs.push({
    label: workspaceLabel,
    href: atWorkspaceRoot ? null : workspaceHref,
  });

  const projectsBase = `/workspaces/${slug}/projects`;

  if (!pathname.startsWith(projectsBase)) {
    // e.g. /workspaces/[slug] — already done
    return <Breadcrumbs crumbs={crumbs} />;
  }

  // /workspaces/[slug]/projects
  const atProjectsList = pathname === projectsBase;
  crumbs.push({
    label: 'projects',
    href: atProjectsList ? null : projectsBase,
  });

  if (!projectId || pathname === `${projectsBase}/create`) {
    if (pathname === `${projectsBase}/create`) {
      crumbs.push({ label: 'create', href: null });
    }
    return <Breadcrumbs crumbs={crumbs} />;
  }

  // /workspaces/[slug]/projects/[projectId]
  const projectLabel = project?.name ?? projectId;
  const projectHref = `${projectsBase}/${projectId}`;
  const atProjectRoot = pathname === projectHref;
  crumbs.push({
    label: projectLabel,
    href: atProjectRoot ? null : projectHref,
  });

  // Sub-pages of the project
  const sub = pathname
    .replace(`${projectsBase}/${projectId}`, '')
    .replace(/^\//, '');

  if (!sub) return <Breadcrumbs crumbs={crumbs} />;

  if (sub === 'settings') {
    crumbs.push({ label: 'settings', href: null });
  } else if (sub === 'epics') {
    crumbs.push({ label: 'epics', href: null });
  } else if (sub === 'sprints') {
    crumbs.push({ label: 'sprints', href: null });
  } else if (issueId) {
    crumbs.push({ label: 'issues', href: `${projectHref}/issues` });
    crumbs.push({ label: issueId.slice(0, 8) + '…', href: null });
    if (sub.endsWith('activity')) {
      crumbs[crumbs.length - 1] = {
        label: issueId.slice(0, 8) + '…',
        href: `${projectHref}/issues/${issueId}/activity`,
      };
      crumbs.push({ label: 'activity', href: null });
    }
  } else {
    // fallback: show first path segment
    crumbs.push({ label: sub.split('/')[0], href: null });
  }

  return <Breadcrumbs crumbs={crumbs} />;
};

function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-4 py-2 text-[11px] font-mono border-b border-green-900/50 bg-black/60 overflow-x-auto whitespace-nowrap custom-scrollbar"
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-green-900 select-none">/</span>}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="text-gray-500 hover:text-green-400 transition-colors truncate max-w-[160px]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? 'text-green-400 font-bold truncate max-w-[200px]'
                    : 'text-gray-500 truncate max-w-[160px]'
                }
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
