package com.dinokids.encyclopedia

import com.dinokids.encyclopedia.model.DinoRepository
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class DinoRepositoryTest {
    @Test
    fun allDinosaursHaveCompleteTrilingualNamesAndChineseIntros() {
        val dinos = DinoRepository.allDinosaurs
        assertEquals(10, dinos.size)

        val uniqueIds = dinos.map { it.id }.toSet()
        assertEquals(dinos.size, uniqueIds.size)

        for (dino in dinos) {
            assertTrue("Missing Chinese name for ${dino.id}", dino.nameZh.isNotBlank())
            assertTrue("Missing Pinyin for ${dino.id}", dino.pinyin.isNotBlank())
            assertTrue("Missing French name for ${dino.id}", dino.nameFr.isNotBlank())
            assertTrue("Missing English name for ${dino.id}", dino.nameEn.isNotBlank())
            assertTrue("Missing Chinese description for ${dino.id}", dino.descriptionZh.length >= 20)
            assertTrue("Missing fun fact for ${dino.id}", dino.funFactZh.isNotBlank())
        }
    }

    @Test
    fun allDinosaurImageAnd3DAssetsExist() {
        val assetsRoot = File("src/main/assets")
        for (dino in DinoRepository.allDinosaurs) {
            val imgFile = File(assetsRoot, dino.imageAssetPath)
            assertTrue("Missing asset image: ${imgFile.path}", imgFile.exists() && imgFile.length() > 0)

            val glbFile = File(assetsRoot, "www/models/${dino.id}.glb")
            assertTrue("Missing 3D GLB model: ${glbFile.path}", glbFile.exists() && glbFile.length() > 100_000)
        }
        assertTrue(File(assetsRoot, "www/dino_viewer.html").exists())
        assertTrue(File(assetsRoot, "www/dinos3d.js").exists())
        assertTrue(File(assetsRoot, "www/lib/three.min.js").exists())
        assertTrue(File(assetsRoot, "www/lib/OrbitControls.js").exists())
        assertTrue(File(assetsRoot, "www/lib/GLTFLoader.js").exists())
        assertTrue(File(assetsRoot, "www/lib/DRACOLoader.js").exists())
        assertTrue(File(assetsRoot, "www/lib/meshopt_decoder.js").exists())
        assertTrue(File(assetsRoot, "www/lib/RoomEnvironment.js").exists())
        assertTrue(File(assetsRoot, "www/lib/draco/draco_decoder.wasm").exists())
    }
}
