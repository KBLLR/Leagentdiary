/**
 * 3D Scene Viewer Component
 * Renders a Three.js scene from JSON configuration
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface SceneData {
  camera?: {
    position: [number, number, number]
    fov?: number
  }
  objects: Array<{
    type: 'box' | 'sphere' | 'cylinder' | 'plane'
    position: [number, number, number]
    rotation?: [number, number, number]
    scale?: [number, number, number]
    color?: string
    wireframe?: boolean
  }>
  lights?: Array<{
    type: 'ambient' | 'directional' | 'point'
    color?: string
    intensity?: number
    position?: [number, number, number]
  }>
}

interface SceneViewerProps {
  sceneData: SceneData
  autoRotate?: boolean
}

export function SceneViewer({ sceneData, autoRotate = true }: SceneViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let scene: THREE.Scene
    let camera: THREE.PerspectiveCamera
    let renderer: THREE.WebGLRenderer
    let controls: OrbitControls
    let animationId: number

    try {
      // Scene setup
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0a0a0a)

      // Camera setup
      const cameraConfig = sceneData.camera || { position: [0, 2, 5], fov: 50 }
      camera = new THREE.PerspectiveCamera(
        cameraConfig.fov || 50,
        canvasRef.current.clientWidth / canvasRef.current.clientHeight,
        0.1,
        1000
      )
      camera.position.set(...cameraConfig.position)

      // Renderer setup
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
      })
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // Orbit controls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.autoRotate = autoRotate
      controls.autoRotateSpeed = 1.5
      controls.enableZoom = true
      controls.minDistance = 2
      controls.maxDistance = 20

      // Add lights
      if (sceneData.lights && sceneData.lights.length > 0) {
        sceneData.lights.forEach((lightConfig) => {
          let light: THREE.Light

          switch (lightConfig.type) {
            case 'ambient':
              light = new THREE.AmbientLight(
                lightConfig.color || '#404040',
                lightConfig.intensity || 0.5
              )
              break
            case 'directional':
              light = new THREE.DirectionalLight(
                lightConfig.color || '#ffffff',
                lightConfig.intensity || 0.8
              )
              if (lightConfig.position) {
                light.position.set(...lightConfig.position)
              }
              break
            case 'point':
              light = new THREE.PointLight(
                lightConfig.color || '#ffffff',
                lightConfig.intensity || 1
              )
              if (lightConfig.position) {
                light.position.set(...lightConfig.position)
              }
              break
            default:
              return
          }

          scene.add(light)
        })
      } else {
        // Default lighting if none specified
        const ambientLight = new THREE.AmbientLight('#404040', 0.5)
        const directionalLight = new THREE.DirectionalLight('#ffffff', 0.8)
        directionalLight.position.set(5, 5, 5)
        scene.add(ambientLight, directionalLight)
      }

      // Add objects
      sceneData.objects.forEach((objConfig) => {
        let geometry: THREE.BufferGeometry

        switch (objConfig.type) {
          case 'box':
            geometry = new THREE.BoxGeometry(1, 1, 1)
            break
          case 'sphere':
            geometry = new THREE.SphereGeometry(0.5, 32, 32)
            break
          case 'cylinder':
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
            break
          case 'plane':
            geometry = new THREE.PlaneGeometry(1, 1)
            break
          default:
            return
        }

        const material = new THREE.MeshStandardMaterial({
          color: objConfig.color || '#818cf8',
          wireframe: objConfig.wireframe || false,
          metalness: 0.3,
          roughness: 0.4,
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(...objConfig.position)

        if (objConfig.rotation) {
          mesh.rotation.set(...objConfig.rotation)
        }

        if (objConfig.scale) {
          mesh.scale.set(...objConfig.scale)
        }

        scene.add(mesh)
      })

      // Animation loop
      const animate = () => {
        animationId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }

      animate()
      setLoading(false)

      // Handle resize
      const handleResize = () => {
        if (!canvasRef.current) return

        const width = canvasRef.current.clientWidth
        const height = canvasRef.current.clientHeight

        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }

      window.addEventListener('resize', handleResize)

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        cancelAnimationFrame(animationId)
        controls.dispose()
        renderer.dispose()
        scene.clear()
      }
    } catch (err) {
      console.error('Scene viewer error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load scene')
      setLoading(false)
    }
  }, [sceneData, autoRotate])

  return (
    <div className="scene-viewer-container">
      <canvas ref={canvasRef} />
      {loading && (
        <div className="scene-viewer-loading">Loading scene...</div>
      )}
      {error && (
        <div className="scene-viewer-error">
          Error loading scene: {error}
        </div>
      )}
    </div>
  )
}
